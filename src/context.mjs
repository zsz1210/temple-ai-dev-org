import fs from "node:fs/promises";
import path from "node:path";
import { REQUIRED_SKILLS } from "./constants.mjs";
import { atomicCreate, atomicWrite, formatJson, pathExists, readJson, sha256 } from "./files.mjs";
import { emptyLearningIndex, LEARNING_INDEX_RELATIVE_PATH } from "./learning.mjs";
import { assignedAgent, loadProjectContext } from "./project.mjs";
import { readWorkItem } from "./work-items.mjs";
import { isWorkItemId } from "./ids.mjs";
import { parallelExecutionForWorkItem } from "./orchestration.mjs";
import {
  evaluateWorkItemSpecRefs,
  readSpecIndex,
  validateRepositorySpecSources,
  validateSpecIndex
} from "./specifications.mjs";
import {
  TRACKER_CONFIG_RELATIVE_PATH,
  TRACKER_VIEW_RELATIVE_PATH,
  emptyTrackerConfig,
  inheritedTrackerReferences,
  trackerVisibility,
  validateTrackerConfig,
  validateTrackerView,
  validateWorkItemTrackerRefs
} from "./tracker.mjs";

export const CONTEXT_MAP_RELATIVE_PATH = ".ai-org/project/context-map.json";
export const CAPABILITY_REGISTRY_RELATIVE_PATH = ".ai-org/views/capabilities.json";
export const CONTEXT_CAPSULE_DIRECTORY = ".ai-org/views/work-items";
export const CONTEXT_MAP_SCHEMA = "temple.context-map/v1";
export const CAPABILITY_REGISTRY_SCHEMA = "temple.capability-registry/v1";
export const CONTEXT_CAPSULE_SCHEMA = "temple.context-capsule/v1";
export const RETRIEVAL_PROVIDER_SCHEMA = "temple.retrieval-provider/v1";

export const CONTEXT_KINDS = [
  "product-spec",
  "technical-spec",
  "adr",
  "domain",
  "module",
  "runbook",
  "test",
  "documentation",
  "other"
];

const CONTEXT_STATUSES = ["active", "deprecated"];
const SKILL_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const CONTEXT_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const EXCLUDED_QUERY_WORDS = new Set([
  "and",
  "for",
  "from",
  "into",
  "the",
  "this",
  "that",
  "with",
  "without",
  "work",
  "item"
]);

const POSITION_HINTS = {
  "temple-init": ["engineering_manager"],
  "temple-work": ["engineering_manager", "release_manager", "observer"],
  "decision-interview": ["engineering_manager", "product_manager", "tech_lead"],
  "domain-modeling": ["product_manager", "tech_lead", "developer"],
  "project-documentation": ["product_manager", "developer"],
  "skill-authoring": ["tech_lead", "developer"],
  tdd: ["developer"],
  "diagnosing-bugs": ["developer", "quality_evaluator", "independent_qa"]
};

export function emptyContextMap() {
  return { schema_version: CONTEXT_MAP_SCHEMA, routes: [] };
}

function uniqueNonEmptyStrings(values) {
  return (
    Array.isArray(values) &&
    values.every((value) => typeof value === "string" && value.trim().length > 0) &&
    new Set(values).size === values.length
  );
}

export function isSafeRepositoryPath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value.includes("\\") &&
    path.posix.normalize(value) === value &&
    value !== ".." &&
    !value.startsWith("../")
  );
}

export function validateContextMap(contextMap, positionIds = null) {
  const errors = [];
  if (contextMap?.schema_version !== CONTEXT_MAP_SCHEMA) {
    errors.push(`schema_version must be ${CONTEXT_MAP_SCHEMA}`);
  }
  if (!Array.isArray(contextMap?.routes)) return { valid: false, errors: [...errors, "routes must be an array"] };

  const ids = new Set();
  for (const [index, route] of contextMap.routes.entries()) {
    const label = `routes[${index}]`;
    if (!CONTEXT_ID.test(route?.id ?? "")) errors.push(`${label}.id is invalid`);
    if (ids.has(route?.id)) errors.push(`${label}.id is duplicated`);
    ids.add(route?.id);
    if (!CONTEXT_KINDS.includes(route?.kind)) errors.push(`${label}.kind is invalid`);
    if (typeof route?.title !== "string" || !route.title.trim()) errors.push(`${label}.title is required`);
    if (typeof route?.summary !== "string" || !route.summary.trim()) errors.push(`${label}.summary is required`);
    if (!uniqueNonEmptyStrings(route?.paths) || route.paths.length === 0) {
      errors.push(`${label}.paths must contain unique repository-relative paths`);
    } else if (route.paths.some((value) => !isSafeRepositoryPath(value))) {
      errors.push(`${label}.paths contains an unsafe repository path`);
    }
    for (const field of ["tags", "positions", "work_items", "read_when"]) {
      if (!uniqueNonEmptyStrings(route?.[field])) errors.push(`${label}.${field} must contain unique non-empty strings`);
    }
    if (route?.positions?.some((value) => positionIds && !positionIds.has(value))) {
      errors.push(`${label}.positions contains an unknown Position`);
    }
    if (route?.work_items?.some((value) => !isWorkItemId(value))) {
      errors.push(`${label}.work_items must contain work item IDs`);
    }
    if (!(route?.owner_position === null || typeof route?.owner_position === "string")) {
      errors.push(`${label}.owner_position must be null or a Position ID`);
    } else if (route.owner_position && positionIds && !positionIds.has(route.owner_position)) {
      errors.push(`${label}.owner_position is unknown`);
    }
    if (!CONTEXT_STATUSES.includes(route?.status)) errors.push(`${label}.status is invalid`);
  }
  return { valid: errors.length === 0, errors };
}

export async function readContextMap(target) {
  return readJson(path.join(target, CONTEXT_MAP_RELATIVE_PATH));
}

export async function ensureContextMap(target) {
  const targetPath = path.join(target, CONTEXT_MAP_RELATIVE_PATH);
  if (await pathExists(targetPath)) return { path: targetPath, created: false, afterHash: null };
  const content = formatJson(emptyContextMap());
  try {
    await atomicCreate(targetPath, content);
    return { path: targetPath, created: true, afterHash: sha256(content) };
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return { path: targetPath, created: false, afterHash: null };
  }
}

function parseSkillFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match) return { name: null, description: null, errors: ["SKILL.md frontmatter is missing"] };
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (!field || line.startsWith(" ") || line.startsWith("\t")) continue;
    values[field[1]] = field[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  const errors = [];
  if (!SKILL_NAME.test(values.name ?? "")) errors.push("frontmatter name is invalid");
  if (!values.description) errors.push("frontmatter description is required");
  return { name: values.name ?? null, description: values.description ?? null, errors };
}

async function readInvocationMetadata(skillDirectory) {
  const metadataPath = path.join(skillDirectory, "agents/openai.yaml");
  if (!(await pathExists(metadataPath))) {
    return { mode: "implicit-or-explicit", declared_dependencies: [] };
  }
  const content = await fs.readFile(metadataPath, "utf8");
  const implicit = !/allow_implicit_invocation:\s*false\b/i.test(content);
  const dependencies = [...content.matchAll(/^\s*value:\s*["']?([^"'\r\n]+)["']?\s*$/gim)].map((match) => match[1].trim());
  return {
    mode: implicit ? "implicit-or-explicit" : "explicit-only",
    declared_dependencies: [...new Set(dependencies)].sort()
  };
}

async function discoverRepositorySkills(target) {
  const skillsRoot = path.join(target, ".agents/skills");
  if (!(await pathExists(skillsRoot))) return [];
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  const skills = [];
  for (const entry of entries.filter((candidate) => candidate.isDirectory())) {
    const directory = path.join(skillsRoot, entry.name);
    if (!(await pathExists(path.join(directory, "SKILL.md")))) continue;
    skills.push({ directoryName: entry.name, directory });
  }
  return skills.sort((left, right) => left.directoryName.localeCompare(right.directoryName));
}

function capabilityDistribution(relativePath, name, lock) {
  const managed = new Set((lock.managed_files ?? []).map((entry) => entry.path)).has(relativePath);
  if (!managed) {
    return {
      lifecycle_owner: "project",
      distribution: "project-extension",
      pack_id: null,
      origin: "undeclared"
    };
  }
  if (REQUIRED_SKILLS.includes(name)) {
    return { lifecycle_owner: "framework", distribution: "core", pack_id: null, origin: "temple" };
  }
  const pack = (lock.optional_packs ?? []).find((entry) => (entry.managed_files ?? []).includes(relativePath));
  if (pack) {
    return { lifecycle_owner: "framework", distribution: "optional-pack", pack_id: pack.id, origin: "temple" };
  }
  return { lifecycle_owner: "framework", distribution: "managed", pack_id: null, origin: "undeclared" };
}

export async function buildCapabilityRegistry(target) {
  const lock = await readJson(path.join(target, "temple.lock"));
  const capabilities = [];
  const issues = [];
  for (const skill of await discoverRepositorySkills(target)) {
    const skillPath = path.join(skill.directory, "SKILL.md");
    const relativePath = `.agents/skills/${skill.directoryName}/SKILL.md`;
    const frontmatter = parseSkillFrontmatter(await fs.readFile(skillPath, "utf8"));
    const skillIssues = [...frontmatter.errors];
    if (frontmatter.name && frontmatter.name !== skill.directoryName) {
      skillIssues.push(`frontmatter name ${frontmatter.name} does not match directory ${skill.directoryName}`);
    }
    const name = frontmatter.name ?? skill.directoryName;
    const distribution = capabilityDistribution(relativePath, name, lock);
    const invocation = await readInvocationMetadata(skill.directory);
    capabilities.push({
      id: name,
      name,
      description: frontmatter.description ?? "",
      path: relativePath,
      ...distribution,
      invocation: invocation.mode,
      declared_dependencies: invocation.declared_dependencies,
      position_hints: POSITION_HINTS[name] ?? [],
      status: skillIssues.length ? "invalid" : "available"
    });
    for (const issue of skillIssues) issues.push(`${relativePath}: ${issue}`);
  }

  capabilities.sort((left, right) => left.id.localeCompare(right.id));
  const counts = {
    total: capabilities.length,
    available: capabilities.filter((entry) => entry.status === "available").length,
    invalid: capabilities.filter((entry) => entry.status === "invalid").length,
    core: capabilities.filter((entry) => entry.distribution === "core").length,
    optional_pack: capabilities.filter((entry) => entry.distribution === "optional-pack").length,
    project_extension: capabilities.filter((entry) => entry.distribution === "project-extension").length
  };
  return {
    schema_version: CAPABILITY_REGISTRY_SCHEMA,
    generated_at: new Date().toISOString(),
    project_id: lock.project_id,
    source_template_version: lock.template?.version ?? null,
    counts,
    capabilities,
    issues
  };
}

export async function writeCapabilityRegistry(target, registry = null) {
  const output = registry ?? (await buildCapabilityRegistry(target));
  const outputPath = path.join(target, CAPABILITY_REGISTRY_RELATIVE_PATH);
  await atomicWrite(outputPath, formatJson(output));
  return outputPath;
}

function normalizedTokens(value) {
  return [
    ...new Set(
      String(value ?? "")
        .normalize("NFKC")
        .toLowerCase()
        .split(/[^\p{L}\p{N}_-]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !EXCLUDED_QUERY_WORDS.has(token))
    )
  ];
}

function textFields(document) {
  return {
    id: String(document.id ?? "").toLowerCase(),
    title: String(document.title ?? document.name ?? "").toLowerCase(),
    summary: String(document.summary ?? document.description ?? "").toLowerCase(),
    tags: (document.tags ?? []).join(" ").toLowerCase(),
    paths: (document.paths ?? [document.path].filter(Boolean)).join(" ").toLowerCase(),
    hints: [...(document.read_when ?? []), ...(document.applies_to ?? [])].join(" ").toLowerCase()
  };
}

function scoreDocument(document, request) {
  const query = String(request.query ?? "").normalize("NFKC").trim().toLowerCase();
  const tokens = normalizedTokens(query);
  const fields = textFields(document);
  const reasons = [];
  let score = 0;
  if ((request.pinned_ids ?? []).includes(document.id)) {
    score += 1000;
    reasons.push("explicit-context-reference");
  }
  if ((document.work_items ?? document.source_work_items ?? []).includes(request.work_item_id)) {
    score += 160;
    reasons.push("work-item-reference");
  }
  if (request.position && (document.positions ?? document.position_hints ?? []).includes(request.position)) {
    score += 30;
    reasons.push("position-match");
  }
  if (query.length > 1 && Object.values(fields).some((value) => value.includes(query))) {
    score += 80;
    reasons.push("phrase-match");
  }
  for (const token of tokens) {
    let tokenScore = 0;
    if (fields.id === token) tokenScore = 45;
    else if (fields.id.includes(token)) tokenScore = 24;
    else if (fields.tags.split(/\s+/).includes(token)) tokenScore = 22;
    else if (fields.title.includes(token)) tokenScore = 16;
    else if (fields.summary.includes(token)) tokenScore = 10;
    else if (fields.paths.includes(token)) tokenScore = 8;
    else if (fields.hints.includes(token)) tokenScore = 6;
    if (tokenScore > 0) {
      score += tokenScore;
      reasons.push(`term:${token}`);
    }
  }
  return { score, reasons: [...new Set(reasons)] };
}

export function createRepositoryRetrievalProvider() {
  return {
    schema_version: RETRIEVAL_PROVIDER_SCHEMA,
    id: "repository-deterministic",
    mode: "deterministic",
    semantic: false,
    async search(request) {
      const limit = Number.isInteger(request.limit) && request.limit > 0 ? request.limit : 5;
      return (request.documents ?? [])
        .filter((document) => document.status !== "deprecated" || (request.pinned_ids ?? []).includes(document.id))
        .map((document) => ({ document, ...scoreDocument(document, request) }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score || left.document.id.localeCompare(right.document.id))
        .slice(0, limit)
        .map((entry) => ({
          id: entry.document.id,
          kind: entry.document.retrieval_kind,
          score: entry.score,
          score_type: "deterministic",
          reasons: entry.reasons,
          source: entry.document
        }));
    }
  };
}

export function validateRetrievalProvider(provider) {
  const errors = [];
  if (provider?.schema_version !== RETRIEVAL_PROVIDER_SCHEMA) {
    errors.push(`schema_version must be ${RETRIEVAL_PROVIDER_SCHEMA}`);
  }
  if (typeof provider?.id !== "string" || !provider.id) errors.push("provider id is required");
  if (typeof provider?.mode !== "string" || !provider.mode) errors.push("provider mode is required");
  if (typeof provider?.search !== "function") errors.push("provider search(request) is required");
  if (typeof provider?.semantic !== "boolean") errors.push("provider semantic must be boolean");
  return { valid: errors.length === 0, errors };
}

function capabilityDocuments(registry) {
  return registry.capabilities
    .filter((entry) => entry.status === "available")
    .map((entry) => ({ ...entry, retrieval_kind: "capability", title: entry.name, summary: entry.description }));
}

export async function findCapabilities(target, options = {}) {
  const registry = options.registry ?? (await buildCapabilityRegistry(target));
  const provider = options.provider ?? createRepositoryRetrievalProvider();
  const validation = validateRetrievalProvider(provider);
  if (!validation.valid) throw new Error(`Invalid Retrieval Provider:\n- ${validation.errors.join("\n- ")}`);
  return provider.search({
    query: options.query,
    position: options.position ?? null,
    work_item_id: options.workItemId ?? null,
    documents: capabilityDocuments(registry),
    pinned_ids: [],
    limit: options.limit
  });
}

function contextRouteDocuments(contextMap) {
  return contextMap.routes.map((route) => ({ ...route, retrieval_kind: "context-route" }));
}

function learningDocuments(index) {
  return (index.entries ?? [])
    .filter(
      (entry) =>
        (entry.kind === "lesson" && entry.status === "validated") ||
        (entry.kind === "practice" && entry.status === "active")
    )
    .map((entry) => ({ ...entry, retrieval_kind: "learning", paths: [entry.path], positions: [] }));
}

function inferredRevision(item, requestedRevision) {
  return (
    requestedRevision ??
    item.closeout_revision ??
    item.qa_evidence_revision ??
    item.tested_revision ??
    item.developer_candidate_revision ??
    item.dispatch_revision ??
    null
  );
}

function overlapStem(value) {
  return String(value).split("*")[0].replace(/\/+$/, "");
}

function pathsOverlap(left, right) {
  const leftStem = overlapStem(left);
  const rightStem = overlapStem(right);
  if (!leftStem || !rightStem) return false;
  return (
    leftStem === rightStem ||
    leftStem.startsWith(`${rightStem}/`) ||
    rightStem.startsWith(`${leftStem}/`)
  );
}

async function findAffectedPathOverlaps(target, item, terminalStates) {
  const affectedPaths = Array.isArray(item.affected_paths) ? item.affected_paths : [];
  if (affectedPaths.length === 0) return [];
  const directory = path.join(target, ".ai-org/work-items");
  if (!(await pathExists(directory))) return [];
  const overlaps = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json") || entry.name === `${item.id}.json`) continue;
    const other = await readJson(path.join(directory, entry.name));
    if (terminalStates.has(other.state)) continue;
    const matches = [];
    for (const currentPath of affectedPaths) {
      for (const otherPath of Array.isArray(other.affected_paths) ? other.affected_paths : []) {
        if (pathsOverlap(currentPath, otherPath)) matches.push({ current_path: currentPath, other_path: otherPath });
      }
    }
    if (matches.length > 0) overlaps.push({ work_item_id: other.id, state: other.state, matches });
  }
  return overlaps.sort((left, right) => left.work_item_id.localeCompare(right.work_item_id));
}

export async function resolveWorkItemContext(target, options) {
  const context = await loadProjectContext(target);
  const item = await readWorkItem(target, options.workItemId);
  const positionId = options.position ?? item.owner_position;
  if (!context.positions.has(positionId)) throw new Error(`Unknown Position: ${positionId}`);
  const contextMap = await readContextMap(target);
  const mapValidation = validateContextMap(contextMap, new Set(context.positions.keys()));
  if (!mapValidation.valid) throw new Error(`Invalid context map:\n- ${mapValidation.errors.join("\n- ")}`);
  const registry = options.registry ?? (await buildCapabilityRegistry(target));
  if (registry.issues.length > 0) throw new Error(`Capability registry has invalid Skills:\n- ${registry.issues.join("\n- ")}`);
  const learningIndex = (await pathExists(path.join(target, LEARNING_INDEX_RELATIVE_PATH)))
    ? await readJson(path.join(target, LEARNING_INDEX_RELATIVE_PATH))
    : emptyLearningIndex();
  const specIndex = await readSpecIndex(target);
  const specIndexValidation = validateSpecIndex(specIndex, new Set(context.positions.keys()));
  if (!specIndexValidation.valid) {
    throw new Error(`Invalid specification index:\n- ${specIndexValidation.errors.join("\n- ")}`);
  }
  const referencedIds = ["spec_refs", "ux_refs", "ui_refs", "contract_refs"].flatMap((field) =>
    (item[field] ?? []).map((reference) => reference?.id).filter(Boolean)
  );
  const sourceValidation = await validateRepositorySpecSources(target, specIndex, referencedIds);
  if (!sourceValidation.valid) {
    throw new Error(`Invalid repository specification sources:\n- ${sourceValidation.errors.join("\n- ")}`);
  }
  const specificationEvaluation = evaluateWorkItemSpecRefs(item, specIndex);
  if (!specificationEvaluation.valid) {
    throw new Error(`Invalid Work Item specification references:\n- ${specificationEvaluation.errors.join("\n- ")}`);
  }
  const trackerConfigInstalled = await pathExists(path.join(target, TRACKER_CONFIG_RELATIVE_PATH));
  const trackerConfig = trackerConfigInstalled
    ? await readJson(path.join(target, TRACKER_CONFIG_RELATIVE_PATH))
    : emptyTrackerConfig();
  const trackerConfigValidation = validateTrackerConfig(trackerConfig);
  if (!trackerConfigValidation.valid) {
    throw new Error(`Invalid tracker configuration:\n- ${trackerConfigValidation.errors.join("\n- ")}`);
  }
  const trackerReferenceValidation = validateWorkItemTrackerRefs(item, trackerConfig);
  if (!trackerReferenceValidation.valid) {
    throw new Error(`Invalid Work Item tracker references:\n- ${trackerReferenceValidation.errors.join("\n- ")}`);
  }
  const inheritedTrackerRefs = await inheritedTrackerReferences(target, item, trackerConfig);
  const trackerView = (await pathExists(path.join(target, TRACKER_VIEW_RELATIVE_PATH)))
    ? await readJson(path.join(target, TRACKER_VIEW_RELATIVE_PATH))
    : { schema_version: "temple.tracker-view/v1", generated_at: null, entries: [] };
  const trackerViewValidation = validateTrackerView(trackerView);
  const provider = options.provider ?? createRepositoryRetrievalProvider();
  const providerValidation = validateRetrievalProvider(provider);
  if (!providerValidation.valid) throw new Error(`Invalid Retrieval Provider:\n- ${providerValidation.errors.join("\n- ")}`);

  const query = [
    item.title,
    ...(item.scope ?? []),
    ...(item.acceptance_criteria ?? []),
    ...(item.unresolved ?? []),
    options.query ?? ""
  ]
    .filter(Boolean)
    .join(" ");
  const commonRequest = {
    query,
    position: positionId,
    work_item_id: item.id,
    pinned_ids: item.context_refs ?? [],
    limit: options.limit
  };
  const [routeResults, learningResults, capabilityResults] = await Promise.all([
    provider.search({ ...commonRequest, documents: contextRouteDocuments(contextMap) }),
    provider.search({ ...commonRequest, pinned_ids: [], documents: learningDocuments(learningIndex) }),
    provider.search({ ...commonRequest, pinned_ids: [], documents: capabilityDocuments(registry) })
  ]);
  const routeIds = new Set(contextMap.routes.map((route) => route.id));
  const missingContextRefs = (item.context_refs ?? []).filter((routeId) => !routeIds.has(routeId));
  const deprecatedContextRefs = (item.context_refs ?? []).filter(
    (routeId) => contextMap.routes.find((route) => route.id === routeId)?.status === "deprecated"
  );
  const terminalStates = new Set(context.workflow.terminal_states ?? []);
  const overlaps = await findAffectedPathOverlaps(target, item, terminalStates);
  const parallelExecution = await parallelExecutionForWorkItem(target, item.id);
  const agent = assignedAgent(context, positionId);
  const warnings = [];
  if (missingContextRefs.length) warnings.push(`Missing context routes: ${missingContextRefs.join(", ")}`);
  if (deprecatedContextRefs.length) warnings.push(`Deprecated context routes: ${deprecatedContextRefs.join(", ")}`);
  if (overlaps.length) warnings.push(`${overlaps.length} active work item(s) overlap affected paths`);
  warnings.push(...specificationEvaluation.warnings);
  warnings.push(...trackerReferenceValidation.warnings);
  if (!trackerConfigInstalled) warnings.push("Tracker configuration is missing; run temple upgrade");
  if (!trackerViewValidation.valid) warnings.push("Generated tracker view is invalid and should be rebuilt");
  if (parallelExecution.plan_installed && !parallelExecution.plan_valid) {
    warnings.push("Generated parallel plan is invalid and should be rebuilt");
  } else if (parallelExecution.plan_installed && parallelExecution.plan_fresh === false) {
    warnings.push("Generated parallel plan is stale; rebuild it before dispatch");
  }
  const specificationsById = new Map(specIndex.entries.map((entry) => [entry.id, entry]));
  const trackerKeys = new Set([
    ...(item.tracker_refs ?? []).map((reference) => `${item.id}:${reference.provider_id}:${reference.item_id}`),
    ...inheritedTrackerRefs.map(
      (reference) => `${reference.inherited_from}:${reference.provider_id}:${reference.item_id}`
    )
  ]);
  const trackerEntries = trackerViewValidation.valid
    ? trackerView.entries.filter((entry) =>
        trackerKeys.has(`${entry.work_item_id}:${entry.observation.provider_id}:${entry.observation.item_id}`)
      )
    : [];

  return {
    schema_version: CONTEXT_CAPSULE_SCHEMA,
    generated_at: new Date().toISOString(),
    work_item: {
      id: item.id,
      path: `.ai-org/work-items/${item.id}.json`,
      title: item.title,
      state: item.state,
      specification_mode: item.specification_mode ?? null,
      ui_delivery_mode: item.ui_delivery_mode ?? null,
      tracker_visibility: trackerVisibility(item),
      scope: item.scope ?? [],
      acceptance_criteria: item.acceptance_criteria ?? [],
      unresolved: item.unresolved ?? []
    },
    position: { id: positionId, name: context.positions.get(positionId).display_name },
    agent: { id: agent.id, display_name: agent.display_name },
    revision: inferredRevision(item, options.revision),
    affected_paths: item.affected_paths ?? [],
    specifications: specificationEvaluation.resolved_refs.map((reference) => ({
      ...reference,
      title: specificationsById.get(reference.id)?.title,
      source: specificationsById.get(reference.id)?.source
    })),
    tracker: {
      profile: trackerConfig.profile,
      sync_granularity: trackerConfig.sync_granularity,
      visibility: trackerVisibility(item),
      direct_refs: item.tracker_refs ?? [],
      inherited_refs: inheritedTrackerRefs,
      observations: trackerEntries.map((entry) => ({
        provider_id: entry.observation.provider_id,
        item_id: entry.observation.item_id,
        url: entry.observation.url,
        observed_at: entry.observation.observed_at,
        revision: entry.observation.revision,
        status: entry.observation.status,
        title: entry.observation.title,
        fields: entry.observation.fields,
        review_count: entry.plan.review_count,
        external_write_performed: false
      }))
    },
    context_routes: routeResults.map((result) => ({
      id: result.id,
      kind: result.source.kind,
      title: result.source.title,
      summary: result.source.summary,
      paths: result.source.paths,
      owner_position: result.source.owner_position,
      status: result.source.status,
      score: result.score,
      reasons: result.reasons
    })),
    learning: learningResults.map((result) => ({
      id: result.id,
      kind: result.source.kind,
      title: result.source.title,
      summary: result.source.summary,
      path: result.source.path,
      status: result.source.status,
      score: result.score,
      reasons: result.reasons
    })),
    capabilities: capabilityResults.map((result) => ({
      id: result.id,
      description: result.source.description,
      path: result.source.path,
      distribution: result.source.distribution,
      invocation: result.source.invocation,
      score: result.score,
      reasons: result.reasons
    })),
    affected_path_overlaps: overlaps,
    parallel_execution: parallelExecution,
    retrieval: {
      provider_schema: provider.schema_version,
      provider_id: provider.id,
      mode: provider.mode,
      semantic: provider.semantic,
      query,
      result_limit_per_kind: Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 5
    },
    warnings
  };
}

export async function writeContextCapsule(target, capsule) {
  const outputPath = path.join(target, CONTEXT_CAPSULE_DIRECTORY, `${capsule.work_item.id}.json`);
  await atomicWrite(outputPath, formatJson(capsule));
  return outputPath;
}
