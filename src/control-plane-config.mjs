import path from "node:path";
import { atomicCreate, formatJson, pathExists, readJson, sha256 } from "./files.mjs";

export const CONTROL_PLANE_CONFIG_SCHEMA = "temple.control-plane-config/v1";
export const CONTROL_PLANE_CONFIG_RELATIVE_PATH = ".ai-org/project/control-plane.json";
export const CONTROL_PLANE_PROVIDER_KINDS = ["repository", "fixture", "codex-app-server", "github"];

export function defaultControlPlaneConfig() {
  return {
    schema_version: CONTROL_PLANE_CONFIG_SCHEMA,
    state_directory: null,
    server: {
      host: "127.0.0.1",
      port: 0
    },
    retention: {
      max_events: 10000
    },
    alerts: {
      stalled_after_ms: 300000,
      pending_for_ms: 30000,
      cooldown_ms: 60000,
      token_budget: null
    },
    privacy: {
      capture_raw_payloads: false,
      max_data_bytes: 16384,
      redact_keys: [
        "api-key",
        "apikey",
        "authorization",
        "cookie",
        "password",
        "secret",
        "token"
      ]
    },
    providers: [
      {
        id: "repository",
        kind: "repository",
        enabled: true
      }
    ]
  };
}

export function validateControlPlaneConfig(document) {
  const errors = [];
  if (document?.schema_version !== CONTROL_PLANE_CONFIG_SCHEMA) {
    errors.push(`schema_version must be ${CONTROL_PLANE_CONFIG_SCHEMA}`);
  }
  if (document?.state_directory !== null && typeof document?.state_directory !== "string") {
    errors.push("state_directory must be null or a path string");
  }
  if (document?.state_directory === "" || document?.state_directory?.includes("\0")) {
    errors.push("state_directory must be null or a non-empty path string");
  }
  if (document?.server?.host !== "127.0.0.1") errors.push("server.host must be 127.0.0.1 in Phase 3");
  if (!Number.isInteger(document?.server?.port) || document.server.port < 0 || document.server.port > 65535) {
    errors.push("server.port must be an integer from 0 to 65535");
  }
  if (
    !Number.isInteger(document?.retention?.max_events) ||
    document.retention.max_events < 100 ||
    document.retention.max_events > 1000000
  ) {
    errors.push("retention.max_events must be an integer from 100 to 1000000");
  }
  if (document?.alerts !== undefined) {
    for (const field of ["stalled_after_ms", "pending_for_ms", "cooldown_ms"]) {
      if (!Number.isInteger(document.alerts?.[field]) || document.alerts[field] < 0 || document.alerts[field] > 604800000) {
        errors.push(`alerts.${field} must be an integer from 0 to 604800000`);
      }
    }
    if (
      document.alerts?.token_budget !== null &&
      (!Number.isInteger(document.alerts?.token_budget) || document.alerts.token_budget < 1)
    ) {
      errors.push("alerts.token_budget must be null or a positive integer");
    }
  }
  if (document?.privacy?.capture_raw_payloads !== false) {
    errors.push("privacy.capture_raw_payloads must remain false in Phase 3");
  }
  if (
    !Number.isInteger(document?.privacy?.max_data_bytes) ||
    document.privacy.max_data_bytes < 1024 ||
    document.privacy.max_data_bytes > 1048576
  ) {
    errors.push("privacy.max_data_bytes must be an integer from 1024 to 1048576");
  }
  if (
    !Array.isArray(document?.privacy?.redact_keys) ||
    document.privacy.redact_keys.length === 0 ||
    document.privacy.redact_keys.some((entry) => typeof entry !== "string" || !entry.trim())
  ) {
    errors.push("privacy.redact_keys must contain non-empty strings");
  }
  const providerIds = new Set();
  if (!Array.isArray(document?.providers) || document.providers.length === 0) {
    errors.push("providers must contain at least the repository provider");
  } else {
    for (const provider of document.providers) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(provider?.id ?? "") || providerIds.has(provider.id)) {
        errors.push("providers contain an invalid or duplicate ID");
      }
      if (!CONTROL_PLANE_PROVIDER_KINDS.includes(provider?.kind)) errors.push("providers contain an unsupported kind");
      if (typeof provider?.enabled !== "boolean") errors.push("provider.enabled must be boolean");
      providerIds.add(provider?.id);
    }
    const repository = document.providers.find((entry) => entry.id === "repository");
    if (!repository || repository.kind !== "repository" || repository.enabled !== true) {
      errors.push("the repository provider must be present and enabled");
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export async function ensureControlPlaneConfig(target) {
  const documentPath = path.join(target, CONTROL_PLANE_CONFIG_RELATIVE_PATH);
  if (await pathExists(documentPath)) return { path: documentPath, created: false, afterHash: null };
  const content = formatJson(defaultControlPlaneConfig());
  try {
    await atomicCreate(documentPath, content);
    return { path: documentPath, created: true, afterHash: sha256(content) };
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return { path: documentPath, created: false, afterHash: null };
  }
}

export async function readControlPlaneConfig(target) {
  const configPath = path.join(target, CONTROL_PLANE_CONFIG_RELATIVE_PATH);
  if (!(await pathExists(configPath))) {
    throw new Error(`${CONTROL_PLANE_CONFIG_RELATIVE_PATH} is missing; run temple upgrade`);
  }
  const document = await readJson(configPath);
  const validation = validateControlPlaneConfig(document);
  if (!validation.valid) throw new Error(`Invalid control-plane configuration: ${validation.errors.join("; ")}`);
  return {
    ...document,
    alerts: {
      ...defaultControlPlaneConfig().alerts,
      ...(document.alerts ?? {})
    }
  };
}
