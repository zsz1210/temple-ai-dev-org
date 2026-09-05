import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { classifyCommandItem, commandGuide, commandPolicyContract } from "../scripts/delivery-command-policy.mjs";

const revision = "a".repeat(40), candidate = "b".repeat(40), claimId = "claim-20260905123456-12345678";
function item(root, command, extra = {}) { return { type: "commandExecution", id: "command-1", status: "inProgress", command, cwd: root, commandActions: [{ type: "unknown", command }], ...extra }; }
const quote = value => `'${value.replaceAll("'", `'\\''`)}'`;
async function fixture(t) {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), "delivery-policy-")), root = path.join(parent, "actor");
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, "test"), { recursive: true });
  await fs.writeFile(path.join(root, "order.mjs"), "export const value = 1;\n");
  await fs.writeFile(path.join(root, "test/public.test.mjs"), "// supplied public tests\n");
  await fs.writeFile(path.join(root, "test/added.test.mjs"), "// added tests\n");
  await fs.writeFile(path.join(root, "templew.mjs"), "// fixture launcher\n");
  const context = { root, arm: "ordinary", stage: "build", expectedClaimRevision: revision, expectedClaimId: claimId, expectedCandidateRevision: candidate, verificationDecision: "accept" };
  return { root, parent, context, classify: (command, changes = {}, envelope = {}) => classifyCommandItem(item(root, command, envelope), { ...context, ...changes }) };
}

test("optimized Temple literal commands bind identity, current claim and exact candidate", async t => {
  const { classify } = await fixture(t);
  const ctx = { arm: "temple" };
  const compact = "node ./templew.mjs context resolve . --work-item WI-0001 --position developer --compact --no-write --json";
  assert.equal(classify(compact, ctx).operation, "temple-context-compact");
  assert.equal(classify(compact, ctx).allowed, true);
  for (const flag of ["--no-write", "--json"]) assert.equal(classify(compact.replace(flag, ""), ctx).allowed, false);
  assert.equal(classify(compact + " --compact", ctx).allowed, false);
  const deliver = `node ./templew.mjs work-item deliver . --work-item WI-0001 --operation-id delivery-v6 --claim-id ${claimId} --agent-id agent-builder --principal-id human --revision ${candidate} --completed 'Feature tested' --evidence DELIVERY.json --json`;
  assert.equal(classify(deliver, ctx).allowed, true);
  assert.equal(classify(deliver, ctx).operation, "temple-deliver");
  assert.equal(classify(deliver, ctx).dry_run, false);
  assert.equal(classify(deliver + " --dry-run", ctx).dry_run, true);
  assert.equal(classify(deliver + " --expected-plan " + "c".repeat(64), ctx).allowed, true);
  for (const [from, to] of [
    ["WI-0001", "WI-0002"], [claimId, "claim-stale"], ["agent-builder", "agent-verifier"], ["human", "other"],
    [candidate, revision], [candidate, "HEAD"], ["DELIVERY.json", "../DELIVERY.json"],
    ["delivery-v6", "../escape"], ["delivery-v6", "a".repeat(65)]
  ]) assert.equal(classify(deliver.replace(from, to), ctx).allowed, false, from + " => " + to);
  for (const suffix of [" --revision " + candidate, " --json false", " --dry-run true", " --expected-plan wrong", " --evidence HANDOFF.md"])
    assert.equal(classify(deliver + suffix, ctx).allowed, false, suffix);
  assert.equal(classify(deliver, { arm: "ordinary" }).allowed, false);
  assert.equal(classify(deliver, { arm: "temple", stage: "verify" }).allowed, false);
  assert.equal(classify(deliver.replace("agent-builder", "agent-verifier"), { arm: "temple", stage: "verify" }).allowed, false);
  assert.equal(classify(deliver, { ...ctx, expectedClaimId: null }).allowed, false);
  assert.equal(classify(deliver, { ...ctx, expectedCandidateRevision: null }).allowed, false);
});

test("ordinary commands have independently specified positive classifications", async t => {
  const { classify } = await fixture(t);
  const cases = [
    ["pwd", "pwd"], ["cat -n -- order.mjs test/public.test.mjs", "cat"], ["ls", "ls"], ["ls -lah test", "ls"],
    ["rg -n -i -F 'CURL; /etc https://example.invalid/$token' .", "rg-search"],
    ["rg -e '-word' test", "rg-search"], ["rg -- '--pre=literal' order.mjs", "rg-search"],
    ["rg --files --hidden -g '*.mjs' test", "rg-files"], ["rg -l --glob '*.mjs' 'quoteOrder' .", "rg-search"],
    ["sed -n '1,40p' order.mjs", "sed-print"], ["sed -n '4p' -- order.mjs", "sed-print"],
    ["head -n 12 order.mjs", "head"], ["tail -n 10000 -- order.mjs", "tail"],
    ["git status --short --branch", "git-status"], ["git status --porcelain=v1", "git-status"],
    ["git diff --stat", "git-diff"], ["git diff --cached --name-only -- order.mjs", "git-diff"],
    [`git diff HEAD ${revision} -- order.mjs`, "git-diff"], ["git diff --check", "git-diff"],
    ["git log -n 5 --oneline", "git-log"], ["git log --max-count 1 HEAD", "git-log"],
    [`git show ${candidate}:order.mjs`, "git-show"], ["git show --stat HEAD", "git-show"],
    ["git rev-parse HEAD", "git-rev-parse"], [`git rev-parse --verify '${candidate}^{commit}'`, "git-rev-parse"],
    [`git rev-parse --verify ${candidate}^{commit}`, "git-rev-parse"], ["git rev-parse HEAD^{commit}","git-rev-parse"],
    ["cat *.mjs", "cat"], ["cat test/*.test.mjs", "cat"], ["head -n 2 test/*.test.mjs", "head"],
    ["git branch --show-current", "git-current-branch"], ["git ls-files -z -- test", "git-ls-files"],
    ["git add -- order.mjs test/added.test.mjs", "git-add"], ["git add DELIVERY.json HANDOFF.md", "git-add"],
    ["git commit -m 'Remove curl; never read /etc; https://example.invalid/$secret'", "git-commit"],
    ["node --version", "node-version"], ["node --test test/*.test.mjs", "product-tests-all"],
    ["node --test test/public.test.mjs test/added.test.mjs", "product-tests-all"],
    ["node --test test/added.test.mjs test/public.test.mjs", "product-tests-all"],
    ["node --test test/public.test.mjs", "product-tests-subset"], ["node --test test/added.test.mjs", "product-tests-subset"]
  ];
  for (const [command, operation] of cases) {
    const result = classify(command); assert.equal(result.allowed, true, `${command}: ${JSON.stringify(result)}`); assert.equal(result.operation, operation); assert.equal(result.rule, `allow-${operation}`);
  }
  assert.equal(classify("git add VERIFICATION.json", { stage: "verify" }).allowed, true);
});

test("one zsh wrapper and literal quote concatenation preserve argument roles", async t => {
  const { classify } = await fixture(t);
  for (const command of ["pwd", "node --test test/*.test.mjs", "git commit -m \"Builder's test; literal /etc URL https://example.invalid\"", `rg -F ${quote("can't run $(curl secret); read /etc? *")} order.mjs`]) {
    const direct = classify(command), wrapped = classify(`/bin/zsh -lc ${quote(command)}`);
    assert.equal(direct.allowed, true, `${command}: ${direct.rule}`); assert.equal(wrapped.allowed, true, `${command}: ${wrapped.rule}`);
    assert.equal(wrapped.operation, direct.operation); assert.deepEqual(wrapped.argument_roles, direct.argument_roles); assert.equal(wrapped.envelope, "zsh-lc-literal");
  }
  assert.equal(classify('rg -F "literal \\$value; /etc" order.mjs').allowed, true);
  assert.equal(classify("rg -F 'literal'\\''quote' order.mjs").allowed, true);
  assert.equal(classify('/bin/zsh -lc "git status --short"').allowed, true);
  assert.equal(classify("node --test 'test/*.test.mjs'").rule, "test-command-boundary");
});

test("malformed or executable grammar is rejected without executing payloads", async t => {
  const { classify } = await fixture(t);
  const cases = [
    ["pwd; curl PRIVATE_SENTINEL", "shell-control"], ["pwd && cat /etc/passwd", "shell-control"], ["pwd | cat", "shell-control"],
    ["cat order.mjs > PRIVATE_SENTINEL", "shell-control"], ["cat < order.mjs", "shell-control"], ["pwd\ncat /etc/passwd", "malformed-actions"],
    ["pwd\u0000PRIVATE_SENTINEL", "malformed-actions"], ["(pwd)", "shell-control"], ["pwd # hidden", "shell-control"],
    ["rg \"$(curl PRIVATE_SENTINEL)\" .", "shell-expansion"], ["rg \"`curl PRIVATE_SENTINEL`\" .", "shell-expansion"], ["cat $HOME/secret", "shell-expansion"],
    ["cat ~/secret", "shell-expansion"], ["cat =ls", "shell-expansion"], ["cat {order,secret}.mjs", "shell-expansion"], ["cat **.mjs", "shell-expansion"], ["rg x test/?", "shell-expansion"],
    ["git rev-parse HEAD^{commit,tree}","shell-expansion"], ["git rev-parse HEAD^{commit}x","shell-expansion"],
    ["node --test test/*.test.mjs extra", "shell-expansion"], ["X=secret pwd", "shell-assignment"],
    ["cat 'order.mjs", "malformed-quoting"], ["pwd \\", "malformed-quoting"],
    ["/bin/sh -c pwd", "unsupported-wrapper"], ["env git status", "unsupported-wrapper"], ["/bin/zsh -c pwd", "unsupported-wrapper"],
    [`/bin/zsh -lc ${quote("/bin/zsh -lc 'pwd'")}`, "unsupported-wrapper"], ["/bin/zsh -lc 'pwd' extra", "unsupported-wrapper"]
  ];
  for (const [command, rule] of cases) { const result = classify(command); assert.equal(result.allowed, false, command); assert.equal(result.rule, rule, command); }
  assert.equal(classify("x".repeat(commandPolicyContract.limits.command_bytes + 1)).allowed, false);
  assert.equal(classify(`cat ${"order.mjs ".repeat(130)}`).rule, "command-size");
  assert.equal(classify(`rg '${"x".repeat(4097)}' .`).rule, "command-size");
});

test("read options and path roles cannot acquire side effects or escape", async t => {
  const { classify, root, parent, context } = await fixture(t);
  await fs.writeFile(path.join(parent, "secret"), "private\n");
  await fs.symlink(parent, path.join(root, "escape"));
  await fs.symlink(path.join(root, "test"), path.join(root, "alias"));
  for (const command of [
    "cat ../secret", "cat test/../../secret", "cat /etc/passwd", "cat 'https://example.invalid'", "cat '~/.codex/memories'",
    "cat escape/secret", "cat escape/new/secret", "cat alias/public.test.mjs", "cat 'test\\..\\secret'", "cat escape/*", "cat alias/*.mjs", "cat ../*", "cat /etc/*",
    "rg --pre 'curl PRIVATE_SENTINEL' x .", "rg --pre=PRIVATE_SENTINEL x .", "rg --follow x .", "rg -L x .", "rg -ni x .",
    "rg -n -n x .", "rg -g '*.mjs' --glob '*.md' x .", "rg --files -e x", "rg -l -n x .",
    "sed -i '1p' order.mjs", "sed -n '1r /etc/passwd' order.mjs", "sed -n '1w secret' order.mjs", "sed -n '1e curl' order.mjs", "sed -n '1p;2p' order.mjs",
    "sed -n '0p' order.mjs", "sed -n '10,1p' order.mjs", "sed -n '1,10001p' order.mjs", "sed -n '1p'",
    "head -n -1 order.mjs", "tail -f order.mjs", "tail -n 10001 order.mjs", "cat -n -n order.mjs", "ls -R .", "ls -la -a .", "cat"
  ]) assert.equal(classify(command).allowed, false, command);
  assert.equal(classify(`cat '${path.join(root, "order.mjs")}'`).allowed, true);
  assert.equal(classify("rg -F '/etc/passwd ../secret curl --pre=x' order.mjs").allowed, true);
  assert.equal(classifyCommandItem(item(path.join(root, "test"), "cat public.test.mjs"), context).allowed, true);
  assert.equal(classifyCommandItem(item(parent, "pwd"), context).rule, "cwd-boundary");
  assert.equal(classifyCommandItem(item(path.join(root, "escape"), "pwd"), context).rule, "cwd-boundary");
  assert.equal(classifyCommandItem(item(path.join(root, "missing"), "pwd"), context).rule, "cwd-unavailable");
  assert.equal(classifyCommandItem(item(".", "pwd"), context).rule, "cwd-unavailable");
});

test("Git operations are read-only or explicitly stage-owned", async t => {
  const { classify } = await fixture(t);
  const forbidden = [
    "git add .", "git add -A", "git add --all", "git add test", "git add test/public.test.mjs", "git add .ai-org/work-items/WI-0001.json",
    "git add ':!BRIEF.md'", "git add ':(top)order.mjs'", "git add -- order.mjs order.mjs",
    "git commit -am 'change'", "git commit -a -m 'change'", "git commit --amend -m 'change'", "git commit --no-verify -m 'change'", "git commit -m x -m y",
    "git config core.hooksPath PRIVATE_SENTINEL", "git -c core.hooksPath=PRIVATE_SENTINEL status", "git --git-dir=/tmp/other status",
    "git diff --no-index order.mjs ../secret", "git diff --ext-diff", "git diff --textconv", "git diff --output secret", "git diff --output=secret",
    "git diff --stat --name-only", "git diff --staged --cached", "git log --format=%x00", "git log --max-count=5", "git status --short -s",
    "git rev-parse --show-toplevel", "git rev-parse --verify main", "git rev-parse --verify aabbcc", "git show HEAD:../secret", "git show HEAD:/etc/passwd", "git branch main"
  ];
  for (const command of forbidden) assert.equal(classify(command).allowed, false, command);
  for (const command of ["git add order.mjs", "git add DELIVERY.json", "git add test/added.test.mjs"]) assert.equal(classify(command, { stage: "verify" }).rule, "git-write-scope", command);
  assert.equal(classify("git commit -m 'Do not use --amend, -a, config, hooks or curl'").allowed, true);
});

test("Temple supports complete bounded Builder and Verifier command obligations", async t => {
  const { classify } = await fixture(t);
  const run = (command, stage = "build", changes = {}) => classify(`node ./templew.mjs ${command}`, { arm: "temple", stage, ...changes });
  for (const stage of ["build", "verify"]) {
    const position = stage === "build" ? "developer" : "quality_evaluator", agent = stage === "build" ? "agent-builder" : "agent-verifier";
    const cases = [
      ["help", "temple-help"], ["--help", "temple-help"], ["work-item claim --help", "temple-help"],
      [`context resolve . --work-item WI-0001 --position ${position} --no-write --json`, "temple-context"],
      ["doctor . --json", "temple-doctor"], ["status . --no-write --json", "temple-status"], ["capability list . --json", "temple-capability-list"],
      [`capability find . --query 'curl; /etc https://example.invalid' --position ${position} --limit 5 --json`, "temple-capability-find"],
      [`work-item claim . --work-item WI-0001 --agent-id ${agent} --principal-id human --base-revision ${revision} --branch main`, "temple-claim"],
      [`work-item release . --work-item WI-0001 --agent-id ${agent} --principal-id human --reason 'literal curl; /etc $x'`, "temple-release"]
    ];
    for (const [command, operation] of cases) { const result = run(command, stage); assert.equal(result.allowed, true, `${command}: ${result.rule}`); assert.equal(result.operation, operation); }
  }
  assert.equal(run(`handoff . --work-item WI-0001 --to quality_evaluator --input-revision ${candidate} --completed 'Feature and tests delivered' --evidence DELIVERY.json`).allowed, true);
  assert.equal(run("transition . --work-item WI-0001 --to test --satisfy developer_handoff=HANDOFF.md --satisfy developer_evidence=DELIVERY.json").operation, "temple-transition-test");
  const done = "transition . --work-item WI-0001 --to done --satisfy test_evidence=VERIFICATION.json --satisfy lean_closeout=VERIFICATION.json";
  assert.equal(run(done, "verify").allowed, true);
  assert.equal(run(done, "verify", { verificationDecision: "reject" }).rule, "temple-decision-boundary");
  assert.equal(run(done, "verify", { verificationDecision: undefined }).rule, "temple-decision-boundary");
});

test("Temple authority is semantic, including exact revisions and named evidence", async t => {
  const { classify, root, context } = await fixture(t);
  const prefix = "node ./templew.mjs ";
  const claim = `work-item claim . --work-item WI-0001 --agent-id agent-builder --principal-id human --base-revision ${revision} --branch main`;
  const handoff = `handoff . --work-item WI-0001 --to quality_evaluator --input-revision ${candidate} --completed 'Done' --evidence DELIVERY.json`;
  const transition = "transition . --work-item WI-0001 --to test --satisfy developer_handoff=HANDOFF.md --satisfy developer_evidence=DELIVERY.json";
  const run = (command, changes = {}) => classify(prefix + command, { arm: "temple", ...changes });
  assert.equal(classify(prefix + "help").rule, "temple-arm-boundary");
  for (const [command, rule] of [
    [claim.replace("WI-0001", "WI-0002"), "temple-work-item-boundary"], [claim.replace("agent-builder", "agent-verifier"), "temple-identity-boundary"],
    [claim.replace("--agent-id agent-builder ", ""), "temple-identity-boundary"], [claim.replace("--principal-id human ", ""), "temple-principal-boundary"],
    [claim.replace("human", "other"), "temple-principal-boundary"], [claim.replace(revision, candidate), "revision-boundary"], [claim.replace(revision, "HEAD"), "revision-boundary"], [claim.replace("main", "other"), "revision-boundary"],
    [claim + " --agent-id agent-builder", "duplicate-option"], [claim.replace("--agent-id agent-builder", "--agent-id=agent-builder"), "unsupported-option"],
    [handoff.replace(candidate, revision), "revision-boundary"], [handoff.replace("quality_evaluator", "release_manager"), "temple-position-boundary"], [handoff.replace("DELIVERY.json", "../DELIVERY.json"), "temple-evidence-boundary"],
    [transition.replace("--to test", "--to done"), "temple-stage-boundary"], [transition.replace("developer_evidence=DELIVERY.json", "developer_handoff=HANDOFF.md"), "temple-evidence-boundary"],
    ["context resolve . --work-item WI-0001 --position developer", "unsupported-option"], ["context resolve . --work-item WI-0001 --position independent_qa --no-write", "temple-position-boundary"],
    ["status . --json", "unsupported-option"], ["capability find . --query x --limit 999", "argument-shape"],
    ["work-item deliver . --work-item WI-0001", "temple-identity-boundary"], ["collaboration sponsor . --principal-id human", "unsupported-command"],
    ["transition . --work-item WI-0001 --to release_gate", "temple-stage-boundary"]
  ]) { const result = run(command); assert.equal(result.allowed, false, command); assert.equal(result.rule, rule, command); }
  assert.equal(run(claim, { expectedClaimRevision: null }).rule, "revision-boundary");
  assert.equal(run(handoff, { expectedCandidateRevision: null }).rule, "revision-boundary");
  assert.equal(run(handoff, { stage: "verify" }).rule, "temple-stage-boundary");
  assert.equal(run(claim, { stage: "verify" }).rule, "temple-identity-boundary");
  assert.equal(classifyCommandItem(item(path.join(root, "test"), prefix + "help"), { ...context, arm: "temple" }).rule, "temple-root-boundary");
  await fs.symlink(path.join(root, "order.mjs"), path.join(root, "DELIVERY.json"));
  assert.equal(run(handoff).rule, "path-symlink");
});

test("executed top command and cwd remain authoritative over best-effort summaries", async t => {
  const { classify, root, parent } = await fixture(t);
  const benign = [{ type: "read", command: "cat order.mjs", name: "order.mjs", path: "order.mjs" }];
  assert.equal(classify("curl PRIVATE_SENTINEL", {}, { commandActions: benign }).rule, "unsupported-command");
  assert.equal(classify("pwd", {}, { cwd: parent, commandActions: benign }).rule, "cwd-boundary");
  assert.equal(classify("pwd", {}, { commandActions: [] }).allowed, true);
  assert.equal(classify("node --test test/*.test.mjs", {}, { commandActions: [] }).operation, "product-tests-all");
  assert.equal(classify("curl PRIVATE_SENTINEL", {}, { commandActions: [] }).rule, "unsupported-command");
  assert.equal(classify("pwd", {}, { cwd: parent, commandActions: [] }).rule, "cwd-boundary");
  assert.equal(classify("cat -n order.mjs", {}, { commandActions: benign }).allowed, true);
  assert.equal(classify("rg --files test", {}, { commandActions: [{ type: "listFiles", command: "rg --files test", path: path.join(root, "test") }] }).allowed, true);
  assert.equal(classify("rg x .", {}, { commandActions: [{ type: "search", command: "rg x .", query: "x", path: null }] }).allowed, true);
  for (const actions of [null, undefined, [{ type: "newPrivateType", command: "pwd" }], [{ type: "read", command: "pwd", path: "." }], [{ type: "unknown", command: "pwd", path: "." }], [{ type: "search", command: "pwd", query: 12 }], Array.from({ length: 33 }, () => ({ type: "unknown", command: "pwd" }))]) assert.equal(classify("pwd", {}, { commandActions: actions }).rule, "malformed-actions");
  for (const extra of [{ type: "mcpToolCall" }, { id: null }, { status: "newPrivateStatus" }, { command: null }]) assert.equal(classify("pwd", {}, extra).rule, "malformed-envelope");
});

test("every persisted classification value belongs to the fixed privacy manifest", async t => {
  const { classify } = await fixture(t), sentinel = "PRIVATE_SENTINEL_12345";
  const results = [classify(`curl ${sentinel}`), classify(`rg '${sentinel}' .`), classify(`git commit -m '${sentinel}'`), classify("pwd", {}, { commandActions: [{ type: sentinel, command: sentinel }] }), classify("pwd", {}, { cwd: `/outside/${sentinel}` }), classify(`node ./templew.mjs work-item claim . --work-item ${sentinel}`, { arm: "temple" })];
  for (const result of results) {
    assert.deepEqual(Object.keys(result), ["allowed", "rule", "family", "operation", "envelope", "argument_roles"]);
    assert.equal(typeof result.allowed, "boolean");
    for (const [key, manifestKey] of [["rule", "rules"], ["family", "families"], ["operation", "operations"], ["envelope", "envelopes"]]) assert.ok(commandPolicyContract[manifestKey].includes(result[key]), `${key}: ${result[key]}`);
    assert.ok(result.argument_roles.every(value => commandPolicyContract.argument_roles.includes(value)));
    assert.equal(JSON.stringify(result).includes(sentinel), false);
  }
  assert.ok(Object.isFrozen(commandPolicyContract)); assert.ok(Object.isFrozen(commandPolicyContract.rules)); assert.doesNotThrow(() => JSON.parse(JSON.stringify(commandPolicyContract)));
  for (const arm of ["ordinary", "temple"]) for (const stage of ["build", "verify"]) { const guide = commandGuide({ arm, stage }); assert.ok(guide.includes("node --test test/*.test.mjs")); assert.equal(guide.includes("work-item deliver"), arm === "temple" && stage === "build"); assert.equal(guide.includes("Temple reads"), arm === "temple"); }
});
