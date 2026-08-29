import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { REQUIRED_POSITIONS, REQUIRED_SKILLS, TEMPLATE_VERSION } from "../src/constants.mjs";
import { pathExists, readJson, walkFiles } from "../src/files.mjs";
import { emptyLearningIndex, validateLearningIndex } from "../src/learning.mjs";
import { listPackDefinitions } from "../src/packs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const packageDocument = await readJson(path.join(root, "package.json"));
check(packageDocument.version === TEMPLATE_VERSION, "package.json and CLI template versions differ");

const localizedReadmes = new Set(["README.md", "README.ja.md", "README.zh-TW.md"]);
const cjkText = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/;
for (const file of (await walkFiles(root)).filter(
  (candidate) =>
    candidate.endsWith(".md") &&
    !candidate.startsWith(".git/") &&
    !candidate.startsWith("node_modules/") &&
    !localizedReadmes.has(candidate)
)) {
  const content = await fs.readFile(path.join(root, file), "utf8");
  check(!cjkText.test(content), `${file} contains CJK text; non-localized documentation must use English`);
}

const projectOverlayRoot = path.join(root, "project-overlay");
const projectOverlayFiles = await walkFiles(projectOverlayRoot);
check(!projectOverlayFiles.includes(".ai-org/project/agents.json"), "project overlay must not contain Agent identities");
check(!projectOverlayFiles.includes(".ai-org/project/assignments.json"), "project overlay must not contain assignments");
for (const file of projectOverlayFiles) {
  const content = await fs.readFile(path.join(projectOverlayRoot, file), "utf8");
  check(!/\bTemple\b/.test(content), `${file} uses the central tool brand in project-facing overlay content`);
}

const positionsDocument = await readJson(path.join(projectOverlayRoot, ".ai-org/core/positions.json"));
const actualPositions = positionsDocument.positions.map((position) => position.id);
check(
  actualPositions.length === REQUIRED_POSITIONS.length,
  `organization system must define exactly ${REQUIRED_POSITIONS.length} Positions`
);
check(REQUIRED_POSITIONS.every((positionId) => actualPositions.includes(positionId)), "required Position is missing");

const learningIndex = await readJson(path.join(projectOverlayRoot, ".ai-org/learning/index.json"));
const learningValidation = validateLearningIndex(learningIndex);
check(learningValidation.valid, `learning index seed is invalid: ${learningValidation.errors.join("; ")}`);
check(
  JSON.stringify(learningIndex) === JSON.stringify(emptyLearningIndex()),
  "project overlay learning index must remain an empty seed"
);

const uiDesignPolicy = await readJson(path.join(projectOverlayRoot, ".ai-org/core/ui-design.json"));
check(uiDesignPolicy.schema_version === "temple.ui-design-policy/v1", "UI design policy schema is invalid");
check(
  JSON.stringify(uiDesignPolicy.delivery_modes?.map((mode) => mode.id)) ===
    JSON.stringify(["code-first", "preview-first", "design-led"]),
  "UI design policy must define the three canonical delivery modes"
);
check(uiDesignPolicy.tool_policy?.required_tool === null, "UI design policy must not require a specific vendor tool");
check(
  projectOverlayFiles.includes(".ai-org/templates/ui-design-brief.md"),
  "UI design brief template is missing"
);

const agentConfigs = projectOverlayFiles.filter((file) => file.startsWith(".codex/agents/") && file.endsWith(".toml"));
check(agentConfigs.length === REQUIRED_POSITIONS.length, "there must be one Codex Position config per Position");
for (const configPath of agentConfigs) {
  const content = await fs.readFile(path.join(projectOverlayRoot, configPath), "utf8");
  const expectedName = path.basename(configPath, ".toml").replaceAll("-", "_");
  check(content.includes(`name = "${expectedName}"`), `${configPath} name must match its Position ID`);
  check(/^description = ".+"$/m.test(content), `${configPath} is missing description`);
  check(/^developer_instructions = """/m.test(content), `${configPath} is missing developer_instructions`);
}

const skillRoot = path.join(projectOverlayRoot, ".agents/skills");
const installedSkills = (await fs.readdir(skillRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
check(
  JSON.stringify(installedSkills) === JSON.stringify([...REQUIRED_SKILLS].sort()),
  `repository Skills differ from the canonical registry: ${installedSkills.join(", ")}`
);
for (const skillName of REQUIRED_SKILLS) {
  const skillPath = path.join(projectOverlayRoot, `.agents/skills/${skillName}/SKILL.md`);
  check(await pathExists(skillPath), `missing repository skill: ${skillName}`);
  if (await pathExists(skillPath)) {
    const content = await fs.readFile(skillPath, "utf8");
    check(content.startsWith("---\n"), `${skillName} frontmatter is missing`);
    check(content.includes(`\nname: ${skillName}\n`), `${skillName} frontmatter name is invalid`);
    check(/\ndescription: .+\n/.test(content), `${skillName} frontmatter description is missing`);
  }
}

const packDefinitions = await listPackDefinitions();
check(packDefinitions.some((definition) => definition.manifest.id === "build-quality"), "build-quality pack is missing");
for (const definition of packDefinitions) {
  check(definition.manifest.enabled_by_default === false, `${definition.manifest.id} must remain opt-in`);
  for (const skillName of definition.manifest.skills) {
    check(!REQUIRED_SKILLS.includes(skillName), `${skillName} cannot be both core and optional`);
    const skillPath = path.join(definition.root, `.agents/skills/${skillName}/SKILL.md`);
    const content = await fs.readFile(skillPath, "utf8");
    check(content.startsWith("---\n"), `${definition.manifest.id}/${skillName} frontmatter is missing`);
    check(content.includes(`\nname: ${skillName}\n`), `${definition.manifest.id}/${skillName} name is invalid`);
    check(/\ndescription: .+\n/.test(content), `${definition.manifest.id}/${skillName} description is missing`);
    check(!/\bTemple\b/.test(content), `${definition.manifest.id}/${skillName} uses the central tool brand`);
  }
}

check(
  (await fs.readFile(path.join(root, ".agents/skills/temple-init/SKILL.md"), "utf8")) ===
    (await fs.readFile(path.join(projectOverlayRoot, ".agents/skills/temple-init/SKILL.md"), "utf8")),
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
  console.log(`Repository checks passed (${projectOverlayFiles.length} overlay files, ${actualPositions.length} Positions).`);
}
