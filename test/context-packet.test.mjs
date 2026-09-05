import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fixture, cli, canonicalBytes, deliveryArgs } from "./helpers/lean-delivery-fixture.mjs";
import { PACKET_SOURCE_LIMIT } from "../src/context-packet.mjs";

async function setup(t) { const f = await fixture(); t.after(f.cleanup); return f; }
const args = f => ["context", "packet", f.target, "--work-item", f.item.id, "--position", "developer", "--no-write", "--json"];
function packet(f, extra = []) {
  const result = cli([...args(f), ...extra], { allowFailure: true });
  return { result, value: JSON.parse(result.stdout) };
}

test("cold stage acquisition deduplicates whole sources, binds provenance and leaves all canonical bytes unchanged", async t => {
  const f = await setup(t);
  const before = await canonicalBytes(f);
  const { result, value } = packet(f);
  assert.equal(result.status, 0, JSON.stringify(value.problems));
  assert.equal(value.acquisition, "complete");
  assert.equal(value.coverage.mutation_authorized, false);
  assert.equal(value.coverage.instruction_loading_verified, false);
  assert.equal(value.coverage.required_reads_waived, false);
  assert.equal(value.coverage.semantic_completeness, "not-asserted");
  const paths = value.sources.map(source => source.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const required of ["AGENTS.md", "TEMPLE.md", "docs/brief.md", ".agents/skills/temple-work/SKILL.md", ".agents/skills/temple-work/references/lean-delivery.md"]) assert.ok(paths.includes(required), required);
  assert.equal(value.sources.find(source => source.path === "docs/brief.md").reasons.filter(reason => reason.startsWith("gate:")).length, 6);
  for (const source of value.sources) {
    const bytes = await fs.readFile(path.join(f.target, source.path));
    assert.equal(source.body, bytes.toString("utf8"));
    assert.equal(source.bytes, bytes.length);
    assert.equal(source.sha256, `sha256:${createHash("sha256").update(bytes).digest("hex")}`);
  }
  assert.deepEqual(await canonicalBytes(f), before);
  assert.equal(packet(f, ["--expected-plan", value.packet_digest]).value.packet_digest, value.packet_digest);
  const full = JSON.parse(cli(["context", "resolve", f.target, "--work-item", f.item.id, "--no-write", "--json"]).stdout);
  assert.equal(full.schema_version, "temple.context-capsule/v2");
  assert.equal(full.source_manifest.source_bodies_retained, false);
  assert.equal(JSON.stringify(full).includes('"body":'), false);
});

test("root-level gate evidence is acquired whole and deduplicated like nested evidence", async t => {
  const f = await setup(t);
  const file = path.join(f.target, `.ai-org/work-items/${f.item.id}.json`);
  const item = JSON.parse(await fs.readFile(file));
  const body = "# Root evidence\nValid local artifact at repository root.\n";
  await fs.writeFile(path.join(f.target, "root-evidence.md"), body);
  item.gate_evidence.approved_scope = ["root-evidence.md"];
  item.gate_evidence.acceptance_criteria = ["root-evidence.md"];
  await fs.writeFile(file, JSON.stringify(item));
  const before = await canonicalBytes(f);
  const { result, value } = packet(f);
  assert.equal(result.status, 0, JSON.stringify(value.problems));
  const sources = value.sources.filter(source => source.path === "root-evidence.md");
  assert.equal(sources.length, 1);
  assert.equal(sources[0].body, body);
  assert.deepEqual(sources[0].reasons, ["gate:acceptance_criteria", "gate:approved_scope"]);
  assert.deepEqual(await canonicalBytes(f), before);
});

test("fresh Verifier receives exact candidate, latest handoff and its own stage procedure", async t => {
  const f = await setup(t);
  const old = packet(f).value.packet_digest;
  cli(deliveryArgs(f));
  const result = cli(args(f).map(value => value === "developer" ? "quality_evaluator" : value));
  const value = JSON.parse(result.stdout);
  assert.equal(value.entry.candidate.developer_revision, f.request.revision);
  assert.equal(value.entry.responsibility.recorded_agent.id, f.qualityAgent);
  assert.ok(value.sources.some(source => source.path === value.entry.candidate.handoff.artifact));
  assert.ok(value.sources.some(source => source.path.endsWith("assurance-and-recovery.md")));
  assert.equal(value.sources.some(source => source.path.endsWith("lean-delivery.md")), false);
  assert.notEqual(value.packet_digest, old);
  const wrong = packet(f);
  assert.equal(wrong.result.status, 1);
  assert.ok(wrong.value.problems.some(problem => problem.code === "wrong-stage-owner"));
  assert.deepEqual(wrong.value.sources, []);
});

test("stale source or authority bindings reject the old digest without emitting bodies or mutating", async t => {
  const f = await setup(t);
  for (const file of ["docs/brief.md", "AGENTS.md", ".ai-org/project/usage-policy.json"]) {
    const old = packet(f).value.packet_digest;
    await fs.appendFile(path.join(f.target, file), "\n ");
    const before = await canonicalBytes(f);
    const stale = packet(f, ["--expected-plan", old]);
    assert.equal(stale.result.status, 1);
    assert.equal(stale.value.code, "STALE_PREVIEW");
    assert.equal(stale.value.mutation_status, "not_started");
    assert.equal(stale.value.sources, undefined);
    assert.deepEqual(await canonicalBytes(f), before);
  }
});

test("missing and hostile source paths fail closed without leaking content", async t => {
  const f = await setup(t);
  const brief = path.join(f.target, "docs/brief.md");
  await fs.unlink(brief);
  const missing = packet(f);
  assert.equal(missing.result.status, 1);
  assert.deepEqual(missing.value.sources, []);
  assert.ok(missing.value.binding.sources.some(source => source.path === "docs/brief.md" && source.reason === "missing-source"));
  const secret = path.join(f.temporary, "outside.txt");
  await fs.writeFile(secret, "outside-sentinel-must-not-appear");
  await fs.symlink(secret, brief);
  const unsafe = packet(f);
  assert.equal(unsafe.result.status, 1);
  assert.equal(unsafe.result.stdout.includes("outside-sentinel-must-not-appear"), false);
  assert.ok(unsafe.value.binding.sources.some(source => source.reason === "non-regular-path"));
});

test("non-text and oversized sources are explicit unavailable inputs, never truncated successes", async t => {
  const f = await setup(t);
  for (const bytes of [Buffer.from([0xff, 0xfe]), Buffer.from("contains\0binary"), Buffer.alloc(PACKET_SOURCE_LIMIT + 1, 65)]) {
    await fs.writeFile(path.join(f.target, "docs/brief.md"), bytes);
    const value = packet(f);
    assert.equal(value.result.status, 1);
    assert.equal(value.value.acquisition, "incomplete");
    assert.deepEqual(value.value.sources, []);
    assert.ok(value.value.binding.sources.some(source => source.path === "docs/brief.md" && source.status === "unavailable"));
  }
});

test("unsafe gate references and unresolved Evidence IDs cannot count as acquired evidence", async t => {
  const f = await setup(t);
  const file = path.join(f.target, `.ai-org/work-items/${f.item.id}.json`);
  const item = JSON.parse(await fs.readFile(file));
  item.gate_evidence.extra = ["../outside.txt", ".git/config", "EVID-9999"];
  await fs.writeFile(file, JSON.stringify(item));
  const before = await canonicalBytes(f);
  const value = packet(f);
  assert.equal(value.result.status, 1);
  assert.deepEqual(value.value.sources, []);
  assert.ok(value.value.problems.some(problem => problem.code === "unresolved-evidence-reference" && problem.source === "EVID-9999"));
  assert.deepEqual(await canonicalBytes(f), before);
});

test("unsupported profile, missing contract and resolver warnings remain incomplete", async t => {
  const f = await setup(t);
  const file = path.join(f.target, `.ai-org/work-items/${f.item.id}.json`);
  const item = JSON.parse(await fs.readFile(file));
  item.risk_tier = "standard";
  item.acceptance_criteria = [];
  item.unresolved = ["Unresolved scope fixture"];
  await fs.writeFile(file, JSON.stringify(item));
  const value = packet(f);
  assert.equal(value.result.status, 1);
  for (const code of ["unsupported-stage-or-profile", "missing-task-contract", "unresolved-work"]) {
    assert.ok(value.value.problems.some(problem => problem.code === code), code);
  }
  assert.deepEqual(value.value.sources, []);
});

test("packet CLI rejects writes, duplicates, missing identity and unsupported selectors before acquisition", async t => {
  const f = await setup(t);
  const before = await canonicalBytes(f);
  const cases = [args(f).filter(arg => arg !== "--no-write"), [...args(f), "--stage", "test"], [...args(f), "--compact"], [...args(f), "--force"], [...args(f), "--position", "developer"], [...args(f), "--expected-plan", "bad"]];
  const withoutPosition = args(f); withoutPosition.splice(withoutPosition.indexOf("--position"), 2); cases.push(withoutPosition);
  for (const argv of cases) {
    const result = cli(argv, { allowFailure: true });
    assert.equal(result.status, 1);
    const value = JSON.parse(result.stdout);
    assert.equal(value.code, "INVALID_INPUT");
    assert.equal(value.mutation_status, "not_started");
    assert.deepEqual(await canonicalBytes(f), before);
  }
});
