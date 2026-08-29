import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

export const REPOSITORY_ROOT = path.resolve(sourceDirectory, "..");
export const TEMPLATE_ROOT = path.join(REPOSITORY_ROOT, "template");
export const PACKAGE_NAME = "@zsz1210/ai-development-org-template";
export const TEMPLATE_VERSION = "0.1.0-alpha.2";
export const TEMPLATE_REPOSITORY = "zsz1210/ai-development-org-template";

export const REQUIRED_POSITIONS = [
  "engineering_manager",
  "product_manager",
  "ux_designer",
  "tech_lead",
  "developer",
  "quality_evaluator",
  "independent_qa",
  "release_manager",
  "observer"
];

export const MANAGED_PATH_PREFIXES = [
  ".ai-org/core/",
  ".ai-org/templates/",
  ".agents/skills/",
  ".codex/agents/"
];

export const MANAGED_EXACT_PATHS = new Set(["TEMPLE.md"]);

export const PROJECT_OWNED_PATHS = [
  "AGENTS.md",
  ".ai-org/project/**",
  ".ai-org/work-items/**",
  ".ai-org/decisions/**",
  ".ai-org/events/**",
  ".ai-org/artifacts/**"
];

export const GENERATED_PATHS = [".ai-org/views/**"];

export const TASK_STATUSES = ["setup", "active", "waiting", "attention", "completed", "archived"];

export const AGENTS_MARKER_START = "<!-- temple:instructions:start -->";
export const AGENTS_MARKER_END = "<!-- temple:instructions:end -->";

export const LEAN_ASSIGNMENT_SLOTS = [
  {
    key: "coordination",
    label: "Coordination (Engineering Manager, Release Manager, Observer)",
    positions: ["engineering_manager", "release_manager", "observer"]
  },
  {
    key: "product",
    label: "Product (Product Manager, UX Designer)",
    positions: ["product_manager", "ux_designer"]
  },
  {
    key: "technical",
    label: "Technical (Tech Lead)",
    positions: ["tech_lead"]
  },
  {
    key: "delivery",
    label: "Delivery (Developer)",
    positions: ["developer"]
  },
  {
    key: "quality",
    label: "Quality (Quality & Evaluation Engineer, Independent QA)",
    positions: ["quality_evaluator", "independent_qa"]
  }
];
