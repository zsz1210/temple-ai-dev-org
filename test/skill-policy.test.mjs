import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { REQUIRED_SKILLS } from "../src/constants.mjs";

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
  assert.equal(new Set(descriptions).size, descriptions.length);

  const scenarios = JSON.parse(await fs.readFile(path.join(root, "test/fixtures/skill-scenarios.json"), "utf8"));
  for (const scenario of scenarios) {
    assert.ok(scenario.expected_skill === null || REQUIRED_SKILLS.includes(scenario.expected_skill));
  }
  for (const skillName of REQUIRED_SKILLS) {
    assert.ok(scenarios.some((scenario) => scenario.expected_skill === skillName), `${skillName} has no scenario`);
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

test("bootstrap and installed init Skills remain byte-identical", async () => {
  const [bootstrap, installed] = await Promise.all([
    fs.readFile(path.join(root, ".agents/skills/temple-init/SKILL.md")),
    fs.readFile(path.join(skillRoot, "temple-init/SKILL.md"))
  ]);
  assert.ok(bootstrap.equals(installed));
});
