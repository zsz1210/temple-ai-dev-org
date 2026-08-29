import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { REQUIRED_POSITIONS, TEMPLATE_VERSION } from "../src/constants.mjs";
import { pathExists, readJson, walkFiles } from "../src/files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const packageDocument = await readJson(path.join(root, "package.json"));
check(packageDocument.version === TEMPLATE_VERSION, "package.json and CLI template versions differ");

const templateRoot = path.join(root, "template");
const templateFiles = await walkFiles(templateRoot);
check(!templateFiles.includes(".ai-org/project/agents.json"), "template must not contain project Agent identities");
check(!templateFiles.includes(".ai-org/project/assignments.json"), "template must not contain project assignments");

const positionsDocument = await readJson(path.join(templateRoot, ".ai-org/core/positions.json"));
const actualPositions = positionsDocument.positions.map((position) => position.id);
check(actualPositions.length === REQUIRED_POSITIONS.length, "template must define exactly nine Positions");
check(REQUIRED_POSITIONS.every((positionId) => actualPositions.includes(positionId)), "required Position is missing");

const agentConfigs = templateFiles.filter((file) => file.startsWith(".codex/agents/") && file.endsWith(".toml"));
check(agentConfigs.length === REQUIRED_POSITIONS.length, "there must be one Codex Position config per Position");
for (const configPath of agentConfigs) {
  const content = await fs.readFile(path.join(templateRoot, configPath), "utf8");
  const expectedName = path.basename(configPath, ".toml").replaceAll("-", "_");
  check(content.includes(`name = "${expectedName}"`), `${configPath} name must match its Position ID`);
  check(/^description = ".+"$/m.test(content), `${configPath} is missing description`);
  check(/^developer_instructions = """/m.test(content), `${configPath} is missing developer_instructions`);
}

for (const skillName of ["temple-init", "temple-grill", "temple-grill-with-docs"]) {
  const skillPath = path.join(templateRoot, `.agents/skills/${skillName}/SKILL.md`);
  check(await pathExists(skillPath), `missing repository skill: ${skillName}`);
  if (await pathExists(skillPath)) {
    const content = await fs.readFile(skillPath, "utf8");
    check(content.startsWith("---\n"), `${skillName} frontmatter is missing`);
    check(content.includes(`\nname: ${skillName}\n`), `${skillName} frontmatter name is invalid`);
    check(/\ndescription: .+\n/.test(content), `${skillName} frontmatter description is missing`);
  }
}

check(
  (await fs.readFile(path.join(root, ".agents/skills/temple-init/SKILL.md"), "utf8")) ===
    (await fs.readFile(path.join(templateRoot, ".agents/skills/temple-init/SKILL.md"), "utf8")),
  "bootstrap and distributable temple-init skills have drifted"
);

for (const file of (await walkFiles(root)).filter(
  (candidate) => !candidate.startsWith(".git/") && !candidate.startsWith("node_modules/")
)) {
  if (!file.endsWith(".json")) continue;
  try {
    JSON.parse(await fs.readFile(path.join(root, file), "utf8"));
  } catch (error) {
    failures.push(`invalid JSON: ${file}: ${error.message}`);
  }
}

const archify = await readJson(path.join(root, "integrations/archify/manifest.json"));
check(archify.enabled_by_default === false, "Archify must remain opt-in");
check(archify.status === "contract-only", "Phase 1 Archify status must be contract-only");
check(archify.pin.tag === "v2.15.0", "Archify tag pin changed without review");
check(
  archify.pin.commit === "e1ac748f19cf805e44bf74fb93c796662152e273",
  "Archify resolved commit changed without review"
);

if (failures.length > 0) {
  console.error(`Repository checks failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Repository checks passed (${templateFiles.length} template files, ${actualPositions.length} Positions).`);
}
