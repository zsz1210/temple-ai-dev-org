import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveGitRevision } from "./evidence.mjs";
import { atomicWrite, formatJson, pathExists, readJson, sha256 } from "./files.mjs";
import { readCollaborationState } from "./collaboration.mjs";
import { appendEvent, withProjectMutationLock } from "./project.mjs";
import { redactTelemetryData } from "./telemetry.mjs";
import { listWorkItemDocuments, readWorkItem } from "./work-items.mjs";

export const HUMAN_INBOX_SCHEMA = "temple.human-inbox/v1";
export const INBOX_COMMANDS_SCHEMA = "temple.inbox-commands/v1";
export const INBOX_SUBMISSIONS_SCHEMA = "temple.inbox-submissions/v1";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const SUBMISSION_ID = /^submission-[a-f0-9]{16}$/;

export class InboxCommandError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "InboxCommandError";
    this.statusCode = statusCode;
  }
}

function stableValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function boundedText(value, limit = 1000) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function currentRevisionReference(item) {
  return item.developer_candidate_revision ?? item.tested_revision ?? item.base_revision ?? null;
}

function exactCurrentRevision(target, item) {
  const reference = currentRevisionReference(item);
  if (!reference) return null;
  try {
    return resolveGitRevision(target, reference);
  } catch {
    return /^[0-9a-f]{40}$/.test(reference) ? reference : null;
  }
}

function commandsPath(stateDirectory) {
  return path.join(stateDirectory, "inbox", "commands.json");
}

function submissionsPath(stateDirectory) {
  return path.join(stateDirectory, "inbox", "submissions.json");
}

function auditPath(stateDirectory) {
  return path.join(stateDirectory, "inbox", "audit.jsonl");
}

async function readCommands(stateDirectory) {
  const filePath = commandsPath(stateDirectory);
  return (await pathExists(filePath))
    ? readJson(filePath)
    : { schema_version: INBOX_COMMANDS_SCHEMA, entries: [] };
}

export async function readInboxSubmissions(stateDirectory) {
  const filePath = submissionsPath(stateDirectory);
  return (await pathExists(filePath))
    ? readJson(filePath)
    : { schema_version: INBOX_SUBMISSIONS_SCHEMA, entries: [] };
}

async function writeSubmissions(stateDirectory, document) {
  await atomicWrite(submissionsPath(stateDirectory), formatJson(document));
}

async function appendAudit(stateDirectory, entry) {
  const filePath = auditPath(stateDirectory);
  const existing = (await pathExists(filePath)) ? await fs.readFile(filePath, "utf8") : "";
  const prefix = existing && !existing.endsWith("\n") ? `${existing}\n` : existing;
  await atomicWrite(filePath, `${prefix}${JSON.stringify(entry)}\n`);
}

function assertExpectedRequest(request, payload, expectedClass) {
  if (!request) throw new InboxCommandError("Provider request is no longer live or answerable", 409);
  if (request.request_class !== expectedClass) throw new InboxCommandError(`Request belongs to ${request.request_class}, not ${expectedClass}`, 409);
  if (payload.expected_method !== request.request_method || payload.expected_observed_at !== request.observed_at) {
    throw new InboxCommandError("Provider request changed after the Inbox view was loaded", 409);
  }
  if (!request.answerable) throw new InboxCommandError("Provider request is no longer answerable", 409);
}

function safeBusinessAnswers(request, answers, privacy) {
  const questions = new Map((request.questions ?? []).map((question) => [question.id, question]));
  const output = {};
  for (const [id, values] of Object.entries(answers ?? {})) {
    const question = questions.get(id);
    output[id] = question?.is_secret
      ? ["[SECRET ANSWER OMITTED]"]
      : (redactTelemetryData({ value: values }, privacy).value ?? []).map((value) => boundedText(value, 1000)).filter(Boolean);
  }
  return output;
}

function assertBusinessAnswers(request, answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new InboxCommandError("Business response answers are required");
  }
  const expectedIds = new Set((request.questions ?? []).map((question) => question.id));
  if (Object.keys(answers).some((id) => !expectedIds.has(id)) || [...expectedIds].some((id) => !Object.hasOwn(answers, id))) {
    throw new InboxCommandError("Business response must answer every current question exactly once");
  }
  for (const [id, values] of Object.entries(answers)) {
    if (!Array.isArray(values) || values.length === 0 || values.length > 20) {
      throw new InboxCommandError(`Question ${id} requires one to twenty answers`);
    }
    if (values.some((value) => !boundedText(value, 1000))) {
      throw new InboxCommandError(`Question ${id} contains an empty answer`);
    }
  }
}

function actorIsAllowed(collaboration, actor) {
  if (collaboration.profile === "solo") return actor === "human";
  return (collaboration.principals ?? []).some((principal) => principal.id === actor && principal.active !== false);
}

function markdownQuote(value) {
  return String(value ?? "").split(/\r?\n/).map((line) => `> ${line}`).join("\n");
}

async function incorporateBusinessFact(target, stateDirectory, payload) {
  const submissions = await readInboxSubmissions(stateDirectory);
  const index = (submissions.entries ?? []).findIndex((entry) => entry.id === payload.submission_id);
  if (index < 0 || !SUBMISSION_ID.test(payload.submission_id ?? "")) throw new InboxCommandError("Business submission was not found", 404);
  const submission = submissions.entries[index];
  if (submission.request_class !== "business-fact") throw new InboxCommandError("Only business-fact submissions can be incorporated", 409);
  if (submission.incorporated_ref) {
    if (payload.work_item_id && payload.work_item_id !== submission.incorporated_work_item_id) {
      throw new InboxCommandError(`Submission is already incorporated into ${submission.incorporated_work_item_id}`, 409);
    }
    return {
      submission_id: submission.id,
      work_item_id: submission.incorporated_work_item_id,
      artifact: submission.incorporated_ref,
      canonical_state_changed: false,
      external_action_performed: false,
      idempotent: true
    };
  }
  if (submission.status !== "proposed") throw new InboxCommandError(`Business submission is ${submission.status}, not proposed`, 409);
  const collaboration = await readCollaborationState(target);
  const actor = String(payload.actor ?? "human");
  if (!actorIsAllowed(collaboration, actor)) throw new InboxCommandError(`Actor ${actor} is not an active Human Principal`, 403);
  const workItemId = String(payload.work_item_id ?? submission.work_item_id ?? "");
  if (!workItemId) throw new InboxCommandError("A Work Item is required for canonical incorporation");
  if (submission.work_item_id && submission.work_item_id !== workItemId) {
    throw new InboxCommandError(`Submission belongs to ${submission.work_item_id}, not ${workItemId}`, 409);
  }

  const result = await withProjectMutationLock(target, async () => {
    const item = await readWorkItem(target, workItemId);
    const exactRevision = exactCurrentRevision(target, item);
    if (payload.expected_state !== item.state || (payload.expected_revision ?? null) !== exactRevision) {
      throw new InboxCommandError("Work Item state or exact revision changed before incorporation", 409);
    }
    const relativePath = `.ai-org/artifacts/${item.id}/business-facts/${submission.id}.md`;
    const absolutePath = path.join(target, relativePath);
    const itemPath = path.join(target, ".ai-org/work-items", `${item.id}.json`);
    const eventPath = path.join(target, ".ai-org/events/events.jsonl");
    const [itemBefore, eventBefore] = await Promise.all([
      fs.readFile(itemPath),
      (await pathExists(eventPath)) ? fs.readFile(eventPath) : null
    ]);
    const lines = Object.entries(submission.answers ?? {}).flatMap(([questionId, values]) => [
      `### ${questionId}`,
      "",
      ...values.map((value) => markdownQuote(value)),
      ""
    ]);
    const content = `# Business fact response — ${item.id}\n\n- Submission: \`${submission.id}\`\n- Proposal captured: \`${submission.created_at}\`\n- Incorporated by: \`${actor}\`\n- Exact revision at incorporation: \`${exactRevision ?? "unavailable"}\`\n\n${lines.join("\n")}\n## Authority boundary\n\nThis artifact is an explicitly incorporated project context reference. It does not independently change scope, acceptance criteria, a specification, a decision, or a lifecycle gate.\n`;
    let artifactCreated = false;
    try {
      const artifactExists = await pathExists(absolutePath);
      if (artifactExists) {
        if ((await fs.readFile(absolutePath, "utf8")) !== content) throw new InboxCommandError(`Canonical artifact already exists with different content: ${relativePath}`, 409);
      } else {
        await atomicWrite(absolutePath, content);
        artifactCreated = true;
      }
      if (artifactExists && (item.context_refs ?? []).includes(relativePath)) {
        return { item, artifact: relativePath, exactRevision, changed: false };
      }
      const updated = {
        ...item,
        updated_at: new Date().toISOString(),
        context_refs: [...new Set([...(item.context_refs ?? []), relativePath])]
      };
      await atomicWrite(itemPath, formatJson(updated));
      await appendEvent(target, {
        timestamp: updated.updated_at,
        event_type: "business_fact_incorporated",
        actor,
        work_item_id: item.id,
        submission_id: submission.id,
        scope_revision: exactRevision,
        refs: [relativePath, `.ai-org/work-items/${item.id}.json`]
      });
      return { item: updated, artifact: relativePath, exactRevision, changed: true };
    } catch (error) {
      await atomicWrite(itemPath, itemBefore);
      if (eventBefore === null) await fs.unlink(eventPath).catch(() => {});
      else await atomicWrite(eventPath, eventBefore);
      if (artifactCreated) await fs.unlink(absolutePath).catch(() => {});
      throw error;
    }
  });

  submissions.entries[index] = {
    ...submission,
    status: "incorporated",
    incorporated_at: new Date().toISOString(),
    incorporated_by: actor,
    incorporated_work_item_id: result.item.id,
    incorporated_ref: result.artifact,
    incorporated_revision: result.exactRevision
  };
  await writeSubmissions(stateDirectory, submissions);
  return {
    submission_id: submission.id,
    work_item_id: result.item.id,
    artifact: result.artifact,
    exact_revision: result.exactRevision,
    canonical_state_changed: result.changed,
    external_action_performed: false
  };
}

async function createGovernanceApproval(target, payload) {
  return withProjectMutationLock(target, async () => {
    const item = await readWorkItem(target, payload.work_item_id);
    if (item.state !== "release_gate" || payload.expected_state !== item.state) {
      throw new InboxCommandError(`Governance approval requires the current release_gate state; found ${item.state}`, 409);
    }
    if (!new Set(["go", "no-go"]).has(payload.decision)) throw new InboxCommandError("Governance decision must be go or no-go");
    const exactRevision = exactCurrentRevision(target, item);
    if (!exactRevision || payload.scope_revision !== exactRevision || payload.expected_revision !== exactRevision) {
      throw new InboxCommandError("Governance approval does not match the current exact candidate revision", 409);
    }
    const collaboration = await readCollaborationState(target);
    const activePrincipals = new Set((collaboration.principals ?? []).filter((entry) => entry.active !== false).map((entry) => entry.id));
    const principalIds = [...new Set((payload.principal_ids ?? []).map((entry) => String(entry)))];
    if (principalIds.length !== (payload.principal_ids ?? []).length || principalIds.some((id) => !activePrincipals.has(id))) {
      throw new InboxCommandError("Governance approval contains a duplicate, unknown, or inactive Human Principal", 403);
    }
    const minimumApprovals = item.assurance?.minimum_approvals ?? 1;
    if (principalIds.length < minimumApprovals) {
      throw new InboxCommandError(`${item.id} requires ${minimumApprovals} distinct Human Principal approvals`, 403);
    }
    if (item.assurance?.profile === "high-assurance") {
      const assignments = await readJson(path.join(target, ".ai-org/project/assignments.json"));
      const developer = (assignments.assignments ?? []).find((entry) => entry.position_id === "developer" && entry.active !== false)?.agent_id;
      const developerSponsor = (collaboration.sponsorships ?? []).find((entry) => entry.agent_id === developer && entry.active !== false)?.principal_id;
      if (principalIds.every((id) => id === developerSponsor)) {
        throw new InboxCommandError("High-Assurance approval requires a Human Principal independent of the Developer sponsor", 403);
      }
    }
    const relativePath = `.ai-org/artifacts/${item.id}/approvals/${exactRevision}-${payload.decision}.json`;
    const absolutePath = path.join(target, relativePath);
    const approvedAt = new Date().toISOString();
    const record = {
      schema_version: "temple.approval/v1",
      work_item_id: item.id,
      decision: payload.decision,
      scope_revision: exactRevision,
      approved_at: approvedAt,
      approvals: principalIds.map((principalId) => ({ principal_id: principalId, approved_at: approvedAt })),
      external_action_authorized: false
    };
    if (await pathExists(absolutePath)) {
      const existing = await readJson(absolutePath);
      const equivalent = existing.work_item_id === record.work_item_id && existing.decision === record.decision &&
        existing.scope_revision === record.scope_revision &&
        JSON.stringify(existing.approvals.map((entry) => entry.principal_id).sort()) === JSON.stringify([...principalIds].sort());
      if (!equivalent) throw new InboxCommandError(`Approval path already contains a different record: ${relativePath}`, 409);
      return { record: existing, artifact: relativePath, changed: false };
    }
    await atomicWrite(absolutePath, formatJson(record));
    try {
      await appendEvent(target, {
        timestamp: approvedAt,
        event_type: "governance_approval_recorded",
        actor: principalIds.join(","),
        work_item_id: item.id,
        decision: payload.decision,
        scope_revision: exactRevision,
        principal_ids: principalIds,
        refs: [relativePath]
      });
    } catch (error) {
      await fs.unlink(absolutePath).catch(() => {});
      throw error;
    }
    return { record, artifact: relativePath, changed: true };
  });
}

export async function buildHumanInbox(target, stateDirectory, codexProvider) {
  const [workItems, collaboration, submissions] = await Promise.all([
    listWorkItemDocuments(target),
    readCollaborationState(target),
    readInboxSubmissions(stateDirectory)
  ]);
  const pending = codexProvider?.pendingRequests?.() ?? [];
  const principals = (collaboration.principals ?? []).filter((entry) => entry.active !== false).map((entry) => ({
    id: entry.id,
    display_name: entry.display_name
  }));
  const governance = workItems.filter((item) => item.state === "release_gate").map((item) => ({
    work_item_id: item.id,
    title: item.title,
    expected_state: item.state,
    exact_revision: exactCurrentRevision(target, item),
    risk_tier: item.risk_tier ?? null,
    minimum_approvals: item.assurance?.minimum_approvals ?? 1,
    principals,
    action_available: Boolean(exactCurrentRevision(target, item) && principals.length >= (item.assurance?.minimum_approvals ?? 1))
  }));
  return {
    schema_version: HUMAN_INBOX_SCHEMA,
    generated_at: new Date().toISOString(),
    runtime_permissions: pending.filter((entry) => entry.request_class === "runtime-permission"),
    business_facts: pending.filter((entry) => entry.request_class === "business-fact"),
    governance_approvals: governance,
    submissions: submissions.entries ?? [],
    authority: {
      runtime_permission: "live-provider-request-only",
      business_fact: "local-proposal-until-explicit-incorporation",
      governance_approval: "canonical-policy-checked-record"
    },
    canonical_state_changed: false,
    external_action_performed: false
  };
}

export function createHumanInboxGateway(options) {
  const { target, stateDirectory, codexProvider, privacy } = options;
  let queue = Promise.resolve();

  async function execute(requestClass, payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new InboxCommandError("Inbox command body must be an object");
    const idempotencyKey = String(payload?.idempotency_key ?? "");
    if (!IDEMPOTENCY_KEY.test(idempotencyKey)) throw new InboxCommandError("A valid 8-to-128-character idempotency_key is required");
    const requestDigest = sha256(JSON.stringify(stableValue({ requestClass, payload })));
    const commands = await readCommands(stateDirectory);
    const existing = (commands.entries ?? []).find((entry) => entry.idempotency_key === idempotencyKey);
    if (existing) {
      if (existing.request_digest !== requestDigest) throw new InboxCommandError("Idempotency key was already used for a different request", 409);
      return { ...existing.result, idempotent_replay: true };
    }

    let result;
    try {
      if (requestClass === "runtime-permission") {
        const request = codexProvider?.pendingRequests?.().find((entry) => entry.request_id === String(payload.request_id));
        assertExpectedRequest(request, payload, "runtime-permission");
        const answered = codexProvider.answerRuntimeRequest(payload.request_id, { decision: payload.decision });
        result = { ...answered, canonical_state_changed: false, external_action_performed: true };
      } else if (requestClass === "business-fact") {
        const request = codexProvider?.pendingRequests?.().find((entry) => entry.request_id === String(payload.request_id));
        assertExpectedRequest(request, payload, "business-fact");
        assertBusinessAnswers(request, payload.answers);
        const submissions = await readInboxSubmissions(stateDirectory);
        const submissionId = `submission-${sha256(idempotencyKey).slice(0, 16)}`;
        const priorSubmission = (submissions.entries ?? []).find((entry) => entry.id === submissionId);
        if (priorSubmission) {
          if (priorSubmission.request_digest !== requestDigest) {
            throw new InboxCommandError("Business submission identity already belongs to a different request", 409);
          }
          if (priorSubmission.status === "proposed") {
            result = {
              request_id: priorSubmission.request_id,
              method: priorSubmission.request_method,
              answered: true,
              request_class: "business-fact",
              submission_id: priorSubmission.id,
              status: "proposed",
              recovered: true,
              canonical_state_changed: false,
              external_action_performed: false
            };
          } else throw new InboxCommandError("A prior business response stopped before provider confirmation; ask the Agent to retry the question", 409);
        }
        if (result) {
          // The local proposal already proves the provider response completed in an earlier attempt.
        } else {
          const submission = {
            id: submissionId,
            request_class: "business-fact",
            request_digest: requestDigest,
            request_id: String(payload.request_id),
            request_method: request.request_method,
            work_item_id: request.work_item_id ?? null,
            task_id: request.task_id ?? null,
            created_at: new Date().toISOString(),
            status: "answering",
            questions: (request.questions ?? []).map((question) => ({ id: question.id, question: question.question, is_secret: question.is_secret })),
            answers: safeBusinessAnswers(request, payload.answers, privacy),
            incorporated_at: null,
            incorporated_by: null,
            incorporated_work_item_id: null,
            incorporated_ref: null,
            incorporated_revision: null
          };
          await writeSubmissions(stateDirectory, { ...submissions, entries: [...(submissions.entries ?? []), submission] });
          let answered;
          try {
            answered = codexProvider.answerRuntimeRequest(payload.request_id, { answers: payload.answers });
          } catch (error) {
            const failed = await readInboxSubmissions(stateDirectory);
            const failedIndex = failed.entries.findIndex((entry) => entry.id === submission.id);
            if (failedIndex >= 0) failed.entries[failedIndex] = { ...failed.entries[failedIndex], status: "provider-rejected" };
            await writeSubmissions(stateDirectory, failed);
            throw error;
          }
          const confirmed = await readInboxSubmissions(stateDirectory);
          const confirmedIndex = confirmed.entries.findIndex((entry) => entry.id === submission.id);
          confirmed.entries[confirmedIndex] = { ...confirmed.entries[confirmedIndex], status: "proposed" };
          await writeSubmissions(stateDirectory, confirmed);
          result = { ...answered, submission_id: submission.id, status: "proposed", canonical_state_changed: false, external_action_performed: true };
        }
      } else if (requestClass === "business-incorporation") {
        result = await incorporateBusinessFact(target, stateDirectory, payload);
      } else if (requestClass === "governance-approval") {
        const created = await createGovernanceApproval(target, payload);
        result = {
          work_item_id: created.record.work_item_id,
          decision: created.record.decision,
          scope_revision: created.record.scope_revision,
          approval_ref: created.artifact,
          principal_ids: created.record.approvals.map((entry) => entry.principal_id),
          canonical_state_changed: created.changed,
          external_action_performed: false
        };
      } else throw new InboxCommandError(`Unsupported Inbox request class: ${requestClass}`, 404);
    } catch (error) {
      await appendAudit(stateDirectory, {
        timestamp: new Date().toISOString(),
        request_class: requestClass,
        idempotency_key: idempotencyKey,
        actor: payload.actor ?? "human",
        work_item_id: payload.work_item_id ?? null,
        expected_state: payload.expected_state ?? null,
        expected_revision: payload.expected_revision ?? payload.scope_revision ?? null,
        result: "rejected",
        error: boundedText(error.message, 500),
        canonical_state_changed: false
      });
      throw error;
    }

    const entry = {
      idempotency_key: idempotencyKey,
      request_digest: requestDigest,
      request_class: requestClass,
      completed_at: new Date().toISOString(),
      result
    };
    await atomicWrite(commandsPath(stateDirectory), formatJson({ ...commands, entries: [...(commands.entries ?? []), entry] }));
    await appendAudit(stateDirectory, {
      timestamp: entry.completed_at,
      request_class: requestClass,
      idempotency_key: idempotencyKey,
      actor: payload.actor ?? ((payload.principal_ids ?? []).join(",") || "human"),
      work_item_id: payload.work_item_id ?? result.work_item_id ?? null,
      expected_state: payload.expected_state ?? null,
      expected_revision: payload.expected_revision ?? payload.scope_revision ?? null,
      result: "accepted",
      canonical_state_changed: result.canonical_state_changed,
      external_action_performed: result.external_action_performed
    });
    return result;
  }

  return {
    submit(requestClass, payload) {
      const run = queue.then(() => execute(requestClass, payload));
      queue = run.catch(() => {});
      return run;
    }
  };
}

export function generateInboxSessionSecret() {
  return crypto.randomBytes(32).toString("base64url");
}
