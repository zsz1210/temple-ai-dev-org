import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { REQUIRED_POSITIONS, REQUIRED_SKILLS, TEMPLATE_VERSION } from "../src/constants.mjs";
import { pathExists, readJson, walkFiles } from "../src/files.mjs";
import { emptyLearningIndex, validateLearningIndex } from "../src/learning.mjs";
import { listPackDefinitions } from "../src/packs.mjs";
import { emptyContextMap, validateContextMap } from "../src/context.mjs";
import { emptySpecIndex, validateSpecIndex } from "../src/specifications.mjs";
import { emptyTrackerConfig, validateTrackerConfig } from "../src/tracker.mjs";

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
check(!projectOverlayFiles.includes(".ai-org/project/collaboration.json"), "project overlay must not contain collaboration identities");
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

const contextMap = await readJson(path.join(projectOverlayRoot, ".ai-org/project/context-map.json"));
const contextMapValidation = validateContextMap(contextMap, new Set(actualPositions));
check(contextMapValidation.valid, `context map seed is invalid: ${contextMapValidation.errors.join("; ")}`);
check(
  JSON.stringify(contextMap) === JSON.stringify(emptyContextMap()),
  "project overlay context map must remain an empty project-owned seed"
);
for (const [file, schemaId] of [
  ["capability-registry.schema.json", "temple.capability-registry/v1"],
  ["context-capsule.schema.json", "temple.context-capsule/v1"],
  ["context-map.schema.json", "temple.context-map/v1"],
  ["retrieval-provider.schema.json", "temple.retrieval-provider/v1"],
  ["collaboration.schema.json", "temple.collaboration/v1"],
  ["parallel-plan.schema.json", "temple.parallel-plan/v1"],
  ["parallel-readiness.schema.json", "temple.parallel-readiness/v1"],
  ["spec-index.schema.json", "temple.spec-index/v1"],
  ["tracker.schema.json", "temple.tracker/v1"]
]) {
  const schema = await readJson(path.join(projectOverlayRoot, ".ai-org/core/schemas", file));
  check(schema.$id === schemaId, `${file} has an unexpected schema ID`);
}

const collaborationProfiles = await readJson(
  path.join(projectOverlayRoot, ".ai-org/core/collaboration-profiles.json")
);
check(
  JSON.stringify(collaborationProfiles.profiles?.map((profile) => profile.id)) ===
    JSON.stringify(["solo", "collaborative", "high-assurance"]),
  "collaboration profiles must define Solo, Collaborative, and High-Assurance in order"
);
check(
  collaborationProfiles.profiles.find((profile) => profile.id === "high-assurance")?.selectable === false,
  "High-Assurance must remain unselectable until its contract is implemented"
);

const learningIndex = await readJson(path.join(projectOverlayRoot, ".ai-org/learning/index.json"));
const learningValidation = validateLearningIndex(learningIndex);
check(learningValidation.valid, `learning index seed is invalid: ${learningValidation.errors.join("; ")}`);
check(
  JSON.stringify(learningIndex) === JSON.stringify(emptyLearningIndex()),
  "project overlay learning index must remain an empty seed"
);

const specIndex = await readJson(path.join(projectOverlayRoot, ".ai-org/project/spec-index.json"));
const specIndexValidation = validateSpecIndex(specIndex, new Set(actualPositions));
check(specIndexValidation.valid, `specification index seed is invalid: ${specIndexValidation.errors.join("; ")}`);
check(
  JSON.stringify(specIndex) === JSON.stringify(emptySpecIndex()),
  "project overlay specification index must remain an empty project-owned seed"
);

const trackerConfig = await readJson(path.join(projectOverlayRoot, ".ai-org/project/tracker.json"));
const trackerValidation = validateTrackerConfig(trackerConfig);
check(trackerValidation.valid, `tracker config seed is invalid: ${trackerValidation.errors.join("; ")}`);
check(
  JSON.stringify(trackerConfig) === JSON.stringify(emptyTrackerConfig()),
  "project overlay tracker config must remain an empty project-owned seed"
);

const uiDesignPolicy = await readJson(path.join(projectOverlayRoot, ".ai-org/core/ui-design.json"));
check(uiDesignPolicy.schema_version === "temple.ui-design-policy/v1", "UI design policy schema is invalid");
check(
  JSON.stringify(uiDesignPolicy.delivery_modes?.map((mode) => mode.id)) ===
    JSON.stringify(["not-applicable", "code-first", "preview-first", "design-led"]),
  "UI design policy must define no-UI plus the three interface delivery modes"
);
check(uiDesignPolicy.tool_policy?.required_tool === null, "UI design policy must not require a specific vendor tool");
check(
  uiDesignPolicy.delivery_modes?.every(
    (mode) => Array.isArray(mode.prebuild_evidence) && Array.isArray(mode.minimum_evidence)
  ),
  "Every UI delivery mode must define prebuild and minimum evidence"
);
check(
  projectOverlayFiles.includes(".ai-org/templates/ui-design-brief.md"),
  "UI design brief template is missing"
);

const organizationPolicies = await readJson(path.join(projectOverlayRoot, ".ai-org/core/policies.json"));
check(
  organizationPolicies.parallel_orchestration?.parallel_by_default_when_safe === true &&
    organizationPolicies.parallel_orchestration?.only_first_fresh_wave_is_dispatchable === true &&
    organizationPolicies.parallel_orchestration?.cli_creates_tasks_or_claims === false &&
    organizationPolicies.parallel_orchestration?.integration_join_required_before_dependent_work === true,
  "parallel orchestration policy must preserve safe-wave, plan-only, and join-gate boundaries"
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
