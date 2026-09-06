// Experiment-local observation policy. This recognizes commands; it never executes
// or rewrites them, and does not provide an OS pre-execution containment boundary.
import { lstatSync, realpathSync, statSync, readdirSync } from "node:fs";
import path from "node:path";

const limits = { command_bytes: 8192, arguments: 128, argument_bytes: 4096, actions: 32, line_count: 10000 };
const operations = ["unknown", "pwd", "cat", "ls", "rg-search", "rg-files", "sed-print", "head", "tail", "git-status", "git-diff", "git-log", "git-show", "git-rev-parse", "git-current-branch", "git-ls-files", "git-add", "git-commit", "node-version", "product-tests-all", "product-tests-subset", "temple-help", "temple-context", "temple-context-compact", "temple-doctor", "temple-status", "temple-capability-find", "temple-capability-list", "temple-claim", "temple-release", "temple-handoff", "temple-deliver", "temple-transition-test", "temple-transition-done"];
const rejectionRules = ["malformed-envelope", "malformed-actions", "invalid-context", "cwd-unavailable", "cwd-boundary", "command-size", "malformed-quoting", "shell-control", "shell-expansion", "shell-assignment", "unsupported-wrapper", "unsupported-command", "unsupported-option", "duplicate-option", "conflicting-options", "argument-shape", "path-boundary", "path-unavailable", "path-symlink", "git-write-scope", "revision-boundary", "test-command-boundary", "temple-arm-boundary", "temple-root-boundary", "temple-work-item-boundary", "temple-identity-boundary", "temple-principal-boundary", "temple-position-boundary", "temple-stage-boundary", "temple-evidence-boundary", "temple-decision-boundary", "policy-unavailable"];
const guides = [
  { arms: ["ordinary", "temple"], stages: ["build", "verify"], text: "One literal command per call; optional /bin/zsh -lc 'COMMAND' wrapper, one layer. No substitution, chaining, redirects, scripts or assignments. Quote search text/messages. Read commands cat/ls/head/tail/sed may use one star in the final local filename component, for example cat test/*.test.mjs; every match must stay local without symlinks. The exact test glob below is also supported." },
  { arms: ["ordinary", "temple"], stages: ["build", "verify"], text: "Read: pwd; cat [-n] [--] PATH...; ls [-l|-a|-h|-d|-1|-la|-al|-lah|-alh|-lh] [PATH...]; rg [-n] [-i] [-F] [-l] [--hidden] [-g GLOB] [-e PATTERN] [--] PATTERN PATH...; rg --files [--hidden] [-g GLOB] [PATH...]. -e supplies the pattern instead of a positional pattern; quote GLOB filters. Paths must stay inside this repository." },
  { arms: ["ordinary", "temple"], stages: ["build", "verify"], text: "Print: sed -n 'N[,N]p' PATH...; head -n N PATH...; tail -n N PATH... (1..10000 lines). Git reads: git status [--short|--porcelain] [--branch]; git diff [--stat|--name-only|--check] [--cached] [REV] [-- PATH...]; git log [-n N] [--oneline]; git show [--stat] [REV[:PATH]]; git rev-parse [--verify] HEAD|FULL_SHA; git branch --show-current; git ls-files [-- PATH...]. Revisions are HEAD or a full SHA; quote a ^{commit} suffix. No Git config, external drivers, hooks or output flags." },
  { arms: ["ordinary", "temple"], stages: ["build", "verify"], text: "Tests: node --test test/*.test.mjs (unquoted shell glob), or node --test test/public.test.mjs test/added.test.mjs. A single public/added file is a subset, not full-test evidence. node --version is supported." },
  { arms: ["ordinary", "temple"], stages: ["build"], text: "Commit: git add [--] explicit paths from order.mjs, test/added.test.mjs, DELIVERY.json, HANDOFF.md; git commit -m 'MESSAGE'. Broad add, automatic staging and amend are unsupported. Commit implementation/tests before writing delivery evidence." },
  { arms: ["ordinary", "temple"], stages: ["verify"], text: "Optional verification commit: git add [--] VERIFICATION.json; git commit -m 'MESSAGE'. Product paths cannot be staged by the verifier." },
  { arms: ["temple"], stages: ["build", "verify"], text: "Temple reads (repository root only): node ./templew.mjs help or --help; context resolve . --work-item WI-0001 --position POSITION --compact --no-write --json (omit --compact for the full view); doctor . [--json]; status . --no-write [--json]; capability list . [--json]; capability find . --query 'TEXT' [--position POSITION] [--limit N] [--json]. POSITION is developer for Builder and quality_evaluator for Verifier." },
  { arms: ["temple"], stages: ["build", "verify"], text: "Temple ownership: node ./templew.mjs work-item claim . --work-item WI-0001 --agent-id AGENT --principal-id human --base-revision CURRENT_FULL_HEAD --branch main; work-item release . --work-item WI-0001 --agent-id AGENT --principal-id human --reason 'TEXT'. AGENT is agent-builder in Build and agent-verifier in verification. Use the same node ./templew.mjs prefix for every Temple operation." },
  { arms: ["temple"], stages: ["build"], text: "Builder delivery: node ./templew.mjs work-item deliver . --work-item WI-0001 --operation-id delivery-v6 --claim-id CURRENT_CLAIM_ID --agent-id agent-builder --principal-id human --revision CANDIDATE_FULL_SHA --completed 'TEXT' --evidence DELIVERY.json --json. Read the actual claim ID from claim output or the Work Item; candidate must match DELIVERY.json. Read .agents/skills/temple-work/references/lean-delivery.md. This single operation records handoff, claim release and Test entry; it does not perform verification. Optional --dry-run and --expected-plan 64_HEX_DIGEST are supported; a preview alone is not delivery." },
  { arms: ["temple"], stages: ["verify"], text: "Verifier closeout: after writing accept in VERIFICATION.json and releasing the claim, node ./templew.mjs transition . --work-item WI-0001 --to done --satisfy test_evidence=VERIFICATION.json --satisfy lean_closeout=VERIFICATION.json. A reject record cannot transition to done." }
];
function freeze(value) { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export const commandPolicyContract = freeze({
  schema_version: "temple.delivery-command-policy/v1", version: "bounded-literal-v3", limits,
  rules: [...rejectionRules, "temple-claim-boundary", ...operations.filter(x => x !== "unknown").map(x => `allow-${x}`)],
  families: ["unknown", "read", "git", "node", "temple"], operations,
  envelopes: ["unrecognized", "direct-literal", "zsh-lc-literal"],
  argument_roles: ["option", "local-path", "search-pattern", "glob-filter", "print-expression", "line-count", "git-revision", "exact-revision", "commit-message", "test-path", "launcher", "work-item", "position", "agent-identity", "principal", "branch", "evidence-reference", "lifecycle-destination", "literal-text", "operation-id", "claim-id", "plan-digest"],
  guides
});
export function commandGuide({ arm, stage }) { return guides.filter(row => row.arms.includes(arm) && row.stages.includes(stage)).map(row => row.text).join("\n"); }

class PolicyFailure extends Error { constructor(rule) { super(rule); this.rule = rule; } }
function need(condition, rule) { if (!condition) throw new PolicyFailure(rule); }
function boundedString(value, maximum = limits.argument_bytes) { return typeof value === "string" && Buffer.byteLength(value) <= maximum && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value); }

// A deliberately small recognizer, not a shell parser. Quoting/escaping is decoded
// only to classify literal argv roles. The original text remains the executed text.
function tokenize(text) {
  need(typeof text === "string" && text.length > 0 && Buffer.byteLength(text) <= limits.command_bytes, "command-size");
  need(!/[\x00-\x08\x0a-\x1f\x7f]/.test(text), "shell-control");
  const tokens = []; let value = "", quote = null, present = false, glob = false;
  const push = () => { if (present) { need(Buffer.byteLength(value) <= limits.argument_bytes && tokens.length < limits.arguments, "command-size"); tokens.push({ value, glob }); } value = ""; present = false; glob = false; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote === "'") { if (char === "'") quote = null; else value += char; continue; }
    if (quote === '"') {
      if (char === '"') { quote = null; continue; }
      if (char === "\\") {
        need(i + 1 < text.length, "malformed-quoting");
        if ('$`"\\'.includes(text[i + 1])) value += text[++i]; else value += char;
      } else { need(char !== "$" && char !== "`", "shell-expansion"); value += char; }
      continue;
    }
    if (char === " " || char === "\t") { push(); continue; }
    if (char === "'" || char === '"') { present = true; quote = char; continue; }
    if (char === "\\") { need(i + 1 < text.length, "malformed-quoting"); present = true; value += text[++i]; continue; }
    need(!";&|<>()".includes(char) && !(char === "#" && !present), "shell-control");
    // A single literal Git type assertion is not shell brace expansion.
    if (char === "^" && /^(HEAD|[a-f0-9]{40})$/.test(value) && text.slice(i, i + 9) === "^{commit}" && (i + 9 === text.length || /[ \t]/.test(text[i + 9]))) { value += "^{commit}"; i += 8; continue; }
    need(!"$`{}".includes(char) && !(["~", "="].includes(char) && !present), "shell-expansion");
    if ("*?[]".includes(char)) glob = true;
    value += char; present = true;
  }
  need(quote === null, "malformed-quoting"); push(); need(tokens.length > 0, "argument-shape");
  need(!/^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[0].value), "shell-assignment");
  return tokens;
}
function recognize(text, state) {
  let tokens = tokenize(text); state.envelope = "direct-literal";
  if (tokens[0].value === "/bin/zsh") {
    state.envelope = "zsh-lc-literal";
    need(tokens.length === 3 && tokens[1].value === "-lc" && !tokens.some(t => t.glob), "unsupported-wrapper");
    tokens = tokenize(tokens[2].value);
    need(!["/bin/zsh", "zsh", "sh", "/bin/sh", "bash", "/bin/bash", "env", "/usr/bin/env"].includes(tokens[0].value), "unsupported-wrapper");
  } else need(!["zsh", "sh", "/bin/sh", "bash", "/bin/bash", "env", "/usr/bin/env"].includes(tokens[0].value), "unsupported-wrapper");
  return tokens;
}
function within(root, candidate) { const relative = path.relative(root, candidate); return relative === "" || (!relative.split(path.sep).includes("..") && !path.isAbsolute(relative)); }
function canonicalRoot(root, cwd) {
  need(typeof root === "string" && path.isAbsolute(root), "invalid-context");
  need(boundedString(cwd) && cwd.length > 0 && path.isAbsolute(cwd), "cwd-unavailable");
  need(!cwd.split(/[\\/]/).includes(".."), "cwd-boundary");
  let realRoot, realCwd;
  try { realRoot = realpathSync(root); realCwd = realpathSync(cwd); need(statSync(realCwd).isDirectory(), "cwd-unavailable"); }
  catch (error) { if (error instanceof PolicyFailure) throw error; throw new PolicyFailure("cwd-unavailable"); }
  need(within(realRoot, realCwd), "cwd-boundary");
  return { root: realRoot, cwd: realCwd, originalRoot: path.resolve(root) };
}
function safePath(value, context) {
  need(boundedString(value) && value.length > 0 && value !== "-" && !/[\\:*?\[\]{}]/.test(value) && !value.startsWith("~") && !value.split("/").includes(".."), "path-boundary");
  let candidate = path.resolve(context.cwd, value);
  // macOS commonly names the same temporary root through /var and /private/var.
  // Map only the supplied root's lexical alias, then inspect each real ancestor.
  if (context.originalRoot && within(context.originalRoot, candidate)) candidate = path.resolve(context.root, path.relative(context.originalRoot, candidate));
  need(within(context.root, candidate), "path-boundary");
  let current = context.root;
  for (const part of path.relative(context.root, candidate).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const info = lstatSync(current);
      if (info.isSymbolicLink()) { need(within(context.root, realpathSync(current)), "path-boundary"); throw new PolicyFailure("path-symlink"); }
    } catch (error) {
      if (error instanceof PolicyFailure) throw error;
      if (error.code === "ENOENT") break;
      throw new PolicyFailure("path-unavailable");
    }
  }
  return path.relative(context.root, candidate).split(path.sep).join("/");
}
function validateActions(actions) {
  // The installed schema requires an array but no minimum length: parsing may
  // yield no best-effort summary. Authority still comes from command plus cwd.
  need(Array.isArray(actions) && actions.length <= limits.actions, "malformed-actions");
  for (const action of actions) {
    need(action && typeof action === "object" && !Array.isArray(action), "malformed-actions");
    const fields = { unknown: ["type", "command"], read: ["type", "command", "name", "path"], listFiles: ["type", "command", "path"], search: ["type", "command", "path", "query"] }[action.type];
    need(fields && Object.keys(action).every(key => fields.includes(key)) && boundedString(action.command, limits.command_bytes) && action.command.length > 0, "malformed-actions");
    if (action.type === "read") need(boundedString(action.name) && boundedString(action.path) && action.path.length > 0, "malformed-actions");
    for (const key of ["path", "query"]) if (key in action && action.type !== "read") need(action[key] === null || boundedString(action[key]), "malformed-actions");
  }
}
function role(state, value) { if (!state.argument_roles.includes(value)) state.argument_roles.push(value); }
function operation(state, family, op) { state.family = family; state.operation = op; }
function count(value) { return /^[1-9][0-9]{0,4}$/.test(value) && Number(value) <= limits.line_count; }
function paths(values, state, context, required = false) { role(state, "local-path"); need(!required || values.length > 0, "argument-shape"); return (values.length ? values : ["."]).map(value => safePath(value, context)); }
function options(args, definitions, state, { repeat = [] } = {}) {
  const found = new Map(), rest = []; let ended = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!ended && arg === "--") { need(!found.has("--"), "duplicate-option"); found.set("--", true); ended = true; role(state, "option"); continue; }
    if (!ended && arg.startsWith("-")) {
      role(state, "option"); const spec = definitions[arg]; need(spec, "unsupported-option");
      const [key, valueRole] = spec; need(!found.has(key) || repeat.includes(key), "duplicate-option");
      let value = true;
      if (valueRole) { role(state, valueRole); need(i + 1 < args.length, "argument-shape"); value = args[++i]; }
      if (repeat.includes(key)) found.set(key, [...(found.get(key) ?? []), value]); else found.set(key, value);
    } else rest.push(arg);
  }
  return { found, rest };
}
const flags = pairs => Object.fromEntries(pairs.map(value => [value, [value]]));
function readCommand(name, args, state, context) {
  operation(state, "read", name === "rg" ? "rg-search" : name === "sed" ? "sed-print" : name);
  if (name === "pwd") { need(args.length === 0, "argument-shape"); return; }
  if (name === "sed") {
    role(state, "option"); role(state, "print-expression");
    need(args[0] === "-n" && args.length >= 3, "argument-shape");
    const match = /^([1-9][0-9]{0,4})(?:,([1-9][0-9]{0,4}))?p$/.exec(args[1]);
    need(match && count(match[1]) && (!match[2] || (count(match[2]) && Number(match[1]) <= Number(match[2]))), "argument-shape");
    const rest = args.slice(args[2] === "--" ? 3 : 2); need(rest.every(v => !v.startsWith("-")), "unsupported-option"); paths(rest, state, context, true); return;
  }
  if (name === "head" || name === "tail") {
    const { found, rest } = options(args, { "-n": ["count", "line-count"] }, state);
    need(found.has("count") && count(found.get("count")), "argument-shape"); paths(rest, state, context, true); return;
  }
  if (name === "cat" || name === "ls") {
    const supported = name === "cat" ? ["-n"] : ["-l", "-a", "-h", "-d", "-1", "-la", "-al", "-lah", "-alh", "-lh"];
    const { found, rest } = options(args, flags(supported), state);
    if (name === "ls") { const letters = [...found.keys()].filter(v => v !== "--").join("").replaceAll("-", "").split(""); need(new Set(letters).size === letters.length, "duplicate-option"); }
    paths(rest, state, context, name === "cat"); return;
  }
  const { found, rest } = options(args, { ...flags(["-n", "-i", "-F", "-l", "--files", "--hidden"]), "-g": ["glob", "glob-filter"], "--glob": ["glob", "glob-filter"], "-e": ["pattern", "search-pattern"] }, state);
  need(!(found.has("-n") && found.has("-l")), "conflicting-options");
  if (found.has("glob")) need(found.get("glob").length > 0, "argument-shape");
  if (found.has("--files")) {
    state.operation = "rg-files"; need(!["pattern", "-n", "-i", "-F", "-l"].some(key => found.has(key)), "conflicting-options");
  } else { role(state, "search-pattern"); if (!found.has("pattern")) need(rest.shift() !== undefined, "argument-shape"); }
  paths(rest, state, context);
}
function gitRevision(value, state, context, allowBlob = false) {
  role(state, "git-revision");
  let revision = value;
  if (allowBlob && value.includes(":")) { const index = value.indexOf(":"); revision = value.slice(0, index); paths([value.slice(index + 1)], state, { ...context, cwd: context.root }, true); }
  need(/^(?:HEAD|[0-9a-f]{40})(?:\^\{commit\})?$/.test(revision), "revision-boundary");
}
function gitCommand(args, state, context) {
  state.family = "git"; const name = args.shift();
  const mapping = { status: "git-status", diff: "git-diff", log: "git-log", show: "git-show", "rev-parse": "git-rev-parse", branch: "git-current-branch", "ls-files": "git-ls-files", add: "git-add", commit: "git-commit" };
  need(Object.hasOwn(mapping, name), "unsupported-command"); state.operation = mapping[name];
  if (name === "branch") { role(state, "option"); need(args.length === 1 && args[0] === "--show-current", "unsupported-option"); return; }
  if (name === "commit") {
    role(state, "option"); role(state, "commit-message"); need(args.length === 2 && args[0] === "-m" && args[1].length > 0, "unsupported-option"); return;
  }
  if (name === "add") {
    const { found, rest } = options(args, {}, state); need(found.size <= 1, "unsupported-option");
    const names = paths(rest, state, context, true);
    const owned = context.stage === "build" ? ["order.mjs", "test/added.test.mjs", "DELIVERY.json", "HANDOFF.md"] : ["VERIFICATION.json"];
    need(names.every(n => owned.includes(n)) && new Set(names).size === names.length, "git-write-scope"); return;
  }
  if (name === "rev-parse") {
    const { found, rest } = options(args, flags(["--verify"]), state); need(!found.has("--") && rest.length === 1, "argument-shape"); gitRevision(rest[0], state, context); return;
  }
  const definitions = {
    status: { "--short": ["short"], "-s": ["short"], "--porcelain": ["porcelain"], "--porcelain=v1": ["porcelain"], "--branch": ["branch"], "-b": ["branch"] },
    diff: { ...flags(["--stat", "--name-only", "--name-status", "--check", "--no-ext-diff", "--no-textconv", "--no-color", "--exit-code"]), "--cached": ["staged"], "--staged": ["staged"] },
    log: { ...flags(["--oneline", "--stat", "--name-only", "--no-color"]), "-n": ["count", "line-count"], "--max-count": ["count", "line-count"] },
    show: flags(["--stat", "--name-only", "--name-status", "--oneline", "--no-ext-diff", "--no-textconv", "--no-color"]),
    "ls-files": flags(["-z", "--cached", "--stage"])
  }[name];
  // Git's separator determines revision versus path roles; do not infer paths
  // from arbitrary revision expressions or permit pathspec magic.
  const divider = args.indexOf("--"), prefix = divider < 0 ? args : args.slice(0, divider), suffix = divider < 0 ? [] : args.slice(divider + 1);
  const { found, rest } = options(prefix, definitions, state);
  if (divider >= 0) { role(state, "option"); need(suffix.length > 0 && !suffix.includes("--"), "argument-shape"); paths(suffix, state, context, true); }
  if (found.has("count")) need(count(found.get("count")), "argument-shape");
  need(["--stat", "--name-only", "--name-status", "--check"].filter(key => found.has(key)).length <= 1, "conflicting-options");
  need(!(found.has("short") && found.has("porcelain")), "conflicting-options");
  if (name === "status" || name === "ls-files") paths(rest, state, context);
  else { need(rest.length <= (name === "diff" ? 2 : 1), "argument-shape"); rest.forEach(value => gitRevision(value, state, context, name === "show")); }
}

function exact(found, key, value, rule) { need(found.get(key) === value, rule); }
function templeCommand(args, state, context) {
  state.family = "temple"; role(state, "launcher");
  need(context.arm === "temple", "temple-arm-boundary"); need(context.cwd === context.root, "temple-root-boundary"); safePath("./templew.mjs", context);
  const helpTopics = ["context", "context resolve", "doctor", "status", "capability", "capability find", "capability list", "work-item", "work-item claim", "work-item release", "work-item deliver", "handoff", "transition"];
  if ((args.length === 1 && ["help", "--help"].includes(args[0])) || (args.at(-1) === "--help" && helpTopics.includes(args.slice(0, -1).join(" ")))) { state.operation = "temple-help"; return; }
  let name = args.shift(); if (["context", "capability", "work-item"].includes(name)) name += ` ${args.shift()}`;
  const mapping = { "context resolve": "temple-context", doctor: "temple-doctor", status: "temple-status", "capability find": "temple-capability-find", "capability list": "temple-capability-list", "work-item claim": "temple-claim", "work-item release": "temple-release", "work-item deliver": "temple-deliver", handoff: "temple-handoff", transition: context.stage === "build" ? "temple-transition-test" : "temple-transition-done" };
  need(Object.hasOwn(mapping, name), "unsupported-command"); state.operation = mapping[name];
  need(args.shift() === ".", "temple-root-boundary"); role(state, "local-path");
  const wi = { "--work-item": ["work-item", "work-item"] }, identity = { "--agent-id": ["agent", "agent-identity"], "--principal-id": ["principal", "principal"] }, json = { "--json": ["json"] };
  const definitions = {
    "context resolve": { ...wi, ...json, "--position": ["position", "position"], "--no-write": ["no-write"], "--compact": ["compact"] },
    doctor: json, status: { ...json, "--no-write": ["no-write"] },
    "capability list": json,
    "capability find": { ...json, "--query": ["query", "literal-text"], "--position": ["position", "position"], "--limit": ["limit", "line-count"] },
    "work-item claim": { ...wi, ...identity, "--base-revision": ["revision", "exact-revision"], "--branch": ["branch", "branch"] },
    "work-item release": { ...wi, ...identity, "--reason": ["reason", "literal-text"] },
    "work-item deliver": { ...wi, ...identity, ...json, "--operation-id": ["operation", "operation-id"], "--claim-id": ["claim", "claim-id"], "--revision": ["revision", "exact-revision"], "--completed": ["completed", "literal-text"], "--evidence": ["evidence", "evidence-reference"], "--dry-run": ["dry-run"], "--expected-plan": ["plan", "plan-digest"] },
    handoff: { ...wi, "--to": ["to", "position"], "--input-revision": ["revision", "exact-revision"], "--completed": ["completed", "literal-text"], "--evidence": ["evidence", "evidence-reference"] },
    transition: { ...wi, "--to": ["to", "lifecycle-destination"], "--satisfy": ["satisfy", "evidence-reference"] }
  }[name];
  const { found, rest } = options(args, definitions, state, { repeat: name === "transition" ? ["satisfy"] : [] });
  need(rest.length === 0 && !found.has("--"), "argument-shape");
  const position = context.stage === "build" ? "developer" : "quality_evaluator", agent = context.stage === "build" ? "agent-builder" : "agent-verifier";
  if (definitions["--work-item"]) exact(found, "work-item", "WI-0001", "temple-work-item-boundary");
  if (name === "context resolve") {
    exact(found, "position", position, "temple-position-boundary"); exact(found, "no-write", true, "unsupported-option");
    if (found.has("compact")) { exact(found, "json", true, "unsupported-option"); state.operation = "temple-context-compact"; }
  }
  if (name === "status") exact(found, "no-write", true, "unsupported-option");
  if (name === "capability find") { need(typeof found.get("query") === "string" && found.get("query").length > 0, "argument-shape"); if (found.has("position")) exact(found, "position", position, "temple-position-boundary"); if (found.has("limit")) need(/^(?:[1-9]|[1-4][0-9]|50)$/.test(found.get("limit")), "argument-shape"); }
  if (name.startsWith("work-item ")) {
    exact(found, "agent", agent, "temple-identity-boundary"); exact(found, "principal", "human", "temple-principal-boundary");
    if (name === "work-item claim") { need(/^[0-9a-f]{40}$/.test(context.expectedClaimRevision ?? ""), "revision-boundary"); exact(found, "revision", context.expectedClaimRevision, "revision-boundary"); exact(found, "branch", "main", "revision-boundary"); }
    else if (name === "work-item release") need(typeof found.get("reason") === "string" && found.get("reason").length > 0, "argument-shape");
  }
  if (name === "work-item deliver") {
    need(context.stage === "build", "temple-stage-boundary");
    need(/^claim-[a-zA-Z0-9-]{1,100}$/.test(context.expectedClaimId ?? ""), "temple-claim-boundary");
    exact(found, "claim", context.expectedClaimId, "temple-claim-boundary");
    need(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(found.get("operation") ?? ""), "argument-shape");
    if (found.has("plan")) need(/^[a-f0-9]{64}$/.test(found.get("plan")), "argument-shape");
    // Observation metadata, not authorization. A successful preview is not delivery.
    state.dry_run = found.has("dry-run");
  }
  if (name === "handoff" || name === "work-item deliver") {
    need(context.stage === "build", "temple-stage-boundary");
    if (name === "handoff") exact(found, "to", "quality_evaluator", "temple-position-boundary");
    need(/^[0-9a-f]{40}$/.test(context.expectedCandidateRevision ?? ""), "revision-boundary"); exact(found, "revision", context.expectedCandidateRevision, "revision-boundary");
    exact(found, "evidence", "DELIVERY.json", "temple-evidence-boundary"); safePath(found.get("evidence"), context);
    need(typeof found.get("completed") === "string" && found.get("completed").length > 0, "argument-shape");
  }
  if (name === "transition") {
    exact(found, "to", context.stage === "build" ? "test" : "done", "temple-stage-boundary");
    const refs = context.stage === "build" ? ["developer_handoff=HANDOFF.md", "developer_evidence=DELIVERY.json"] : ["test_evidence=VERIFICATION.json", "lean_closeout=VERIFICATION.json"];
    const actual = found.get("satisfy"); need(Array.isArray(actual) && actual.length === 2 && new Set(actual).size === 2 && refs.every(ref => actual.includes(ref)), "temple-evidence-boundary");
    for (const ref of actual) safePath(ref.split("=")[1], context);
    if (context.stage === "verify") need(context.verificationDecision === "accept", "temple-decision-boundary");
  }
}
function nodeCommand(tokens, state, context) {
  state.family = "node"; const args = tokens.map(t => t.value);
  if (args.length === 1 && args[0] === "--version") { state.operation = "node-version"; return; }
  if (args[0] === "./templew.mjs") { templeCommand(args.slice(1), state, context); return; }
  need(args[0] === "--test", "unsupported-command"); role(state, "option"); role(state, "test-path");
  const tests = args.slice(1); state.operation = "product-tests-subset";
  if (tests.length === 1 && tests[0] === "test/*.test.mjs") {
    need(tokens[1].glob && context.cwd === context.root, "test-command-boundary"); safePath("test/public.test.mjs", context); safePath("test/added.test.mjs", context); state.operation = "product-tests-all"; return;
  }
  need(tests.length > 0 && tests.length <= 2 && new Set(tests).size === tests.length, "test-command-boundary");
  need(tests.every(v => ["test/public.test.mjs", "test/added.test.mjs"].includes(v)) && context.cwd === context.root, "test-command-boundary");
  tests.forEach(value => safePath(value, context)); if (tests.length === 2) state.operation = "product-tests-all";
}

export function classifyCommandItem(item, options = {}) {
  const state = { allowed: false, rule: "malformed-envelope", family: "unknown", operation: "unknown", envelope: "unrecognized", argument_roles: [] };
  try {
    need(item && typeof item === "object" && item.type === "commandExecution" && boundedString(item.id) && item.id.length > 0 && ["inProgress", "completed", "failed", "declined"].includes(item.status) && typeof item.command === "string", "malformed-envelope");
    need(["ordinary", "temple"].includes(options.arm) && ["build", "verify"].includes(options.stage), "invalid-context");
    const context = { ...options, ...canonicalRoot(options.root, item.cwd) };
    validateActions(item.commandActions);
    const tokens = recognize(item.command, state), [program, ...rawArgs] = tokens;
    need(!program.glob, "shell-expansion");
    const args = rawArgs.flatMap((token, i) => {
      if (!token.glob) return [token];
      if (program.value === "node" && tokens[1]?.value === "--test" && tokens.length === 3 && i === 1 && token.value === "test/*.test.mjs") return [token];
      need(["cat","ls","head","tail","sed"].includes(program.value), "shell-expansion");
      const directory = path.dirname(token.value), pattern = path.basename(token.value);
      need(!token.value.startsWith("-") && /^[^*?\[\]{}]*\*[^*?\[\]{}]*$/.test(pattern), "shell-expansion");
      const relative = safePath(directory, context);
      const [prefix,suffix] = pattern.split("*");
      const matches = readdirSync(path.join(context.root,relative)).filter(name => (prefix.startsWith(".") || !name.startsWith(".")) && name.startsWith(prefix) && name.endsWith(suffix) && name.length >= prefix.length + suffix.length).sort();
      need(matches.length > 0 && matches.length <= limits.arguments, "argument-shape");
      return matches.map(name => { need(!name.startsWith("-"),"argument-shape"); const value = path.join(directory,name); safePath(value,context); return {value,glob:false}; });
    });
    need(args.length < limits.arguments, "command-size");
    if (["pwd", "cat", "ls", "rg", "sed", "head", "tail"].includes(program.value)) readCommand(program.value, args.map(t => t.value), state, context);
    else if (program.value === "git") gitCommand(args.map(t => t.value), state, context);
    else if (program.value === "node") nodeCommand(args, state, context);
    else throw new PolicyFailure("unsupported-command");
    state.allowed = true; state.rule = `allow-${state.operation}`;
  } catch (error) { state.rule = error instanceof PolicyFailure ? error.rule : "policy-unavailable"; }
  return state;
}
