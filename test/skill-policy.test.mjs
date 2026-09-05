import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { REQUIRED_SKILLS } from "../src/constants.mjs";
import { listPackDefinitions } from "../src/packs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "project-overlay/.agents/skills");

test("repository Skill set and scenario contract match the canonical registry", async () => {
  const installed = (await fs.readdir(skillRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(installed, [...REQUIRED_SKILLS].sort());

  const descriptions = [];
  for (const skillName of REQUIRED_SKILLS) {
    const content = await fs.readFile(path.join(skillRoot, skillName, "SKILL.md"), "utf8");
    assert.match(content, new RegExp(`^---\\nname: ${skillName}\\ndescription: [^\\n]+\\n---\\n`));
    descriptions.push(content.match(/^description: (.+)$/m)[1]);
  }
  const packDefinitions = await listPackDefinitions();
  const optionalSkills = [];
  for (const definition of packDefinitions) {
    assert.equal(definition.manifest.enabled_by_default, false);
    for (const skillName of definition.manifest.skills) {
      const content = await fs.readFile(
        path.join(root, `packs/${definition.manifest.id}/.agents/skills/${skillName}/SKILL.md`),
        "utf8"
      );
      assert.match(content, new RegExp(`^---\\nname: ${skillName}\\ndescription: [^\\n]+\\n---\\n`));
      descriptions.push(content.match(/^description: (.+)$/m)[1]);
      optionalSkills.push({ skillName, packId: definition.manifest.id });
    }
  }
  assert.equal(new Set(descriptions).size, descriptions.length);

  const scenarios = JSON.parse(await fs.readFile(path.join(root, "test/fixtures/skill-scenarios.json"), "utf8"));
  const knownSkills = new Set([...REQUIRED_SKILLS, ...optionalSkills.map((entry) => entry.skillName)]);
  for (const scenario of scenarios) {
    assert.ok(scenario.expected_skill === null || knownSkills.has(scenario.expected_skill));
  }
  for (const skillName of REQUIRED_SKILLS) {
    assert.ok(scenarios.some((scenario) => scenario.expected_skill === skillName), `${skillName} has no scenario`);
  }
  for (const { skillName, packId } of optionalSkills) {
    assert.ok(
      scenarios.some((scenario) => scenario.expected_skill === skillName && scenario.required_pack === packId),
      `${skillName} has no optional-pack scenario`
    );
  }
  assert.ok(
    scenarios.some(
      (scenario) =>
        scenario.id === "status-only" && scenario.expected_skill === null && scenario.repository_mutation === false
    )
  );
  assert.deepEqual(
    new Set(
      scenarios
        .filter((scenario) => scenario.expected_skill === "decision-interview")
        .map((scenario) => scenario.mode)
    ),
    new Set(["conversational", "evidence-backed", "persistence-authorized"])
  );
});

test("delivery Skill distinguishes bounded reuse from recovery and missing authority", async () => {
  const skill = await fs.readFile(path.join(skillRoot, "temple-work/SKILL.md"), "utf8");
  // Instruction-contract guard only; real model adherence is a separate observation.
  const entry = skill.split("## Start and route work\n")[1].split("\n4.")[0];
  assert.match(entry, /1\. For a known Work Item, first preview `node \.\/templew\.mjs context resolve .*--no-write --json`/);
  assert.match(entry, /already read and still available in this session/);
  assert.match(entry, /unchanged measured hash/);
  assert.match(entry, /not unselected policy or proof of reading/);
  assert.match(entry, /unreadable required source blocks/);
  assert.match(entry, /new work, recovery, an incomplete route, or unclear authority/);
  assert.match(entry, /TEMPLE_BOOTSTRAP_REQUIRED.*takes precedence/);

  const scenarios = JSON.parse(await fs.readFile(path.join(root, "test/fixtures/skill-scenarios.json"), "utf8"));
  for (const [id, mutation] of [
    ["known-work-resume", true],
    ["fresh-session-or-pending-bootstrap", false],
    ["unreadable-required-authority", false]
  ]) {
    const scenario = scenarios.find((entry) => entry.id === id);
    assert.equal(scenario?.expected_skill, "temple-work", id);
    assert.equal(scenario.repository_mutation, mutation, id);
  }
});

test("delivery instructions use CLI titles and keep closeout profile-specific", async () => {
  const skill = await fs.readFile(path.join(skillRoot, "temple-work/SKILL.md"), "utf8");
  const instructions = await fs.readFile(path.join(root, "project-overlay/AGENTS.md"), "utf8");
  assert.match(skill, /CLI's `suggested_title` verbatim/);
  assert.doesNotMatch(skill, /Work Item ID · Position · Agent Name/);
  for (const content of [skill, instructions]) {
    assert.match(content, /effective workflow profile/);
    assert.match(content, /\.ai-org\/core\/workflow\.json/);
  }
  assert.match(skill, /For Standard and High-Assurance, Independent QA must use a different Agent Identity from Developer/);
  assert.match(skill, /For eligible Lean at `test`, use `temple transition --to done` with `test_evidence` and `lean_closeout`/);
  assert.match(skill, /not Independent QA or a release approval/);
  assert.match(skill, /For profiles reaching `release_gate`, use `temple close`/);

  // Check the documented Lean edge against configuration, not a second policy engine.
  const workflow = JSON.parse(await fs.readFile(path.join(root, "project-overlay/.ai-org/core/workflow.json"), "utf8"));
  const lean = workflow.profiles.find((profile) => profile.id === "lean");
  assert.deepEqual(lean.transitions.find((edge) => edge.from === "test"), {
    from: "test", to: "done", requires: ["test_evidence", "lean_closeout"]
  });
  for (const id of ["standard", "high-assurance"]) {
    const profile = workflow.profiles.find((entry) => entry.id === id);
    assert.ok(profile.transitions.some((edge) => edge.to === "independent_qa"), id);
    assert.ok(profile.transitions.some((edge) => edge.to === "release_gate"), id);
  }
});
