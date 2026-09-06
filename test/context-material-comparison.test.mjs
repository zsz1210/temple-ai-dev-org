import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { schedule, limits, validatePlan, validateApproval, requestsFor, evidenceScope, isolationArguments, assertIsolationSources, assertIsolatedConfig, commandJson, sealEvidence, verifySeal, evidenceFiles, consumeApproval, executeMatrix, configurationHashMatches } from "../scripts/context-material-comparison.mjs";
import { digest, stageRequests, itemDiagnostics, eventViolation, runStage, safeFailureCode, gitSafety } from "../scripts/delivery-control-pair.mjs";
import { finalizeEvidence } from "../scripts/context-material-comparison.mjs";
import { execFileSync } from "node:child_process";
import { classifyCommandItem } from "../scripts/delivery-command-policy.mjs";

const isolation = { schema_version: "temple.comparison-isolation/v1", sources: [{ path: "/unused-fixture-config", sha256: null }], mcp_servers: ["fixture"], plugins: ["fixture@local"], apps: [] };
function plan() { return { schema_version: "temple.context-comparison/v3", work_item_id: "WI-0210", evidence_scope: evidenceScope, isolation:{...isolation,fixture_trust_roots:schedule.map((_,i)=>`/tmp/fixture-${i}`)}, model: "gpt-5.6-terra", reasoning_effort: "medium", schedule: [...schedule], limits: { ...limits }, policy: { account: "chatgpt-subscription", purchase: false, refill: false, reset: false, retries: 0, fallback: false, cache: "uncontrolled", extra_judge: false }, subjects: schedule.map((variant,i) => ({ variant, root:`/tmp/fixture-${i}`, arm: variant === "ordinary" ? "ordinary" : "temple" })) }; }
test("comparison fixes the approved model, stages, limits, order and one-shot account policy", () => {
  const p = plan(); assert.equal(validatePlan(p), true);
  for (const change of [{ model: "gpt-6-astra" }, { reasoning_effort: "high" }, { schedule: [...schedule].reverse().slice(1) }, { subjects: p.subjects.slice(1) }, { limits: { ...limits, stages: 13 } }, { limits: { ...limits, aggregate_operational_tokens: 960001 } }, { policy: { ...p.policy, reset: true } }, { policy: { ...p.policy, retries: 1 } }]) assert.throws(() => validatePlan({ ...p, ...change }));
  const a = { status: "approved", work_item_id: "WI-0210", approved_by: "human", evidence_ref: ".ai-org/artifacts/WI-0210/design.md", protocol_sha256: digest(p), limits, policy: p.policy };
  assert.doesNotThrow(() => validateApproval(a, p));
  for (const change of [{ status: "pending" }, { protocol_sha256: digest({ ...p, extra: true }) }, { approved_by: "agent-rikku" }, { limits: { ...limits, stages: 14 } }, { policy: { ...p.policy, purchase: true } }]) assert.throws(() => validateApproval({ ...a, ...change }, p));
});

async function temp(t) { const root = await fs.mkdtemp(path.join(os.tmpdir(), "comparison-test-")); t.after(() => fs.rm(root, { recursive: true, force: true })); return root; }
test("command diagnostics distinguish status, empty and invalid responses without retaining payload", () => {
  assert.deepEqual(commandJson({exitCode:0,stdout:'{"ok":true}',stderr:""}), {ok:true});
  for (const [r,code] of [[{},"command-status-missing"],[{exitCode:124,stdout:"",stderr:"private secret"},"command-nonzero"],[{exitCode:0,stdout:" "},"command-output-empty"],[{exitCode:0,stdout:"private invalid JSON"},"command-output-invalid-json"]]) {
    assert.throws(()=>commandJson(r), e=>e.message===code && !JSON.stringify(e).includes("private") && "exit_code" in e.diagnostic);
  }
});
test("only exact newly registered fixture trust sections can restore the original complete config hash", () => {
  const base='model = "fixed"\n', root='/private/tmp/fixture-new', block='\n[projects."/private/tmp/fixture-new"]\ntrust_level = "trusted"\n';
  assert.equal(configurationHashMatches(Buffer.from(base+block),digest(base),[root]),true);
  for(const text of [base+block.replace('trusted','untrusted'),base+block+'extra = true\n',base+block+'# extra comment\n',base.replace('fixed','changed')+block,base+block.replace('fixture-new','unrelated'),base+block+block]) assert.equal(configurationHashMatches(Buffer.from(text),digest(base),[root]),false);
  assert.equal(configurationHashMatches(Buffer.from(base+block),digest(base),[]),false);
  const valid = '# \uFFFD\n' + base;
  const invalid = Buffer.concat([Buffer.from('# '), Buffer.from([255]), Buffer.from('\n' + base + block)]);
  assert.equal(configurationHashMatches(invalid,digest(valid),[root]),false);
  assert.equal(configurationHashMatches(Buffer.from(base+block),digest(base),['/tmp/fixture-new']),false);
  const second=block.replaceAll('fixture-new','fixture-other');assert.equal(configurationHashMatches(Buffer.from(base+block+second),digest(base),[root,'/private/tmp/fixture-other']),true);
  assert.equal(configurationHashMatches(Buffer.from(base+block+second),digest(base+block),['/private/tmp/fixture-other']),true);
  assert.equal(configurationHashMatches(Buffer.from(base+block.replace('trusted','untrusted')+second),digest(base+block),['/private/tmp/fixture-other']),false);
  const multiline='x = """\n'+base+block+'"""\n';assert.equal(configurationHashMatches(Buffer.from(multiline),digest(base),[root]),false);
  const p=plan();assert.throws(()=>validatePlan({...p,isolation:{...p.isolation,fixture_trust_roots:['/tmp/unrelated']}}),/trust-scope/);
});
test("isolation pins source bytes and disables every inherited tool map before launch", async t => {
  const root=await temp(t), file=path.join(root,"config.toml"); await fs.writeFile(file,"initial");
  const p={...isolation,sources:[{path:file,sha256:digest("initial")}]}; assertIsolationSources(p);
  const args=isolationArguments(p); assert.ok(args.includes('mcp_servers.fixture.enabled=false')); assert.ok(args.includes('plugins.fixture@local.enabled=false'));
  await fs.writeFile(file,"changed"); assert.throws(()=>assertIsolationSources(p), /source-drift/);
  const c={features:{hooks:false,multi_agent:false,tool_suggest:false,remote_plugin:false},web_search:"disabled",apps:{_default:{enabled:false}},mcp_servers:{fixture:{enabled:false}},plugins:{"fixture@local":{enabled:false}}};
  assertIsolatedConfig({config:c},p);
  for(const field of ["mcp_servers","plugins","apps"]) {
    assert.throws(()=>assertIsolatedConfig({config:{...c,[field]:{...c[field],unexpected:{enabled:true}}}},p), /isolation/);
    for(const v of [[],"",null,undefined,{}, {fixture:{}}]) assert.throws(()=>assertIsolatedConfig({config:{...c,[field]:v}},p), /isolation/);
  }
  assert.throws(()=>assertIsolatedConfig({config:{...c,features:{...c.features,hooks:true}}},p), /isolation/);
});
test("fixture trust exceptions never apply to other source files or symlink roots", async t => {
  const root = await fs.realpath(await temp(t)), file = path.join(root, "config.toml");
  const base = 'model = "fixed"\n';
  await fs.writeFile(file, base + `\n[projects.${JSON.stringify(root)}]\ntrust_level = "trusted"\n`);
  const profile = { ...isolation, sources: [{ path: file, sha256: digest(base) }], fixture_trust_roots: [root] };
  assert.throws(() => assertIsolationSources(profile), /isolation-source-drift/);
  const alias = path.join(root, "alias"); await fs.symlink(root, alias);
  assert.throws(() => assertIsolationSources({ ...profile, fixture_trust_roots: [alias] }), /isolation-trust-root/);
  assert.equal(safeFailureCode(Error("isolation-source-drift")), "isolation-source-drift");
  assert.equal(safeFailureCode(Error("private config contents")), "observation-invalid");
});
test("manifest excludes exact scratch only, keeps lookalikes and detects later durable changes", async t => {
  const root=await temp(t); await fs.writeFile(path.join(root,"run.json"),'{}');
  await fs.mkdir(path.join(root,"subject-1.runtime")); await fs.mkdir(path.join(root,"subject-1.runtime-lookalike"));
  await fs.writeFile(path.join(root,"subject-1.runtime-lookalike","evidence"),"keep");
  await sealEvidence(root,()=>fs.writeFile(path.join(root,"subject-1.runtime","cache"),"late"));
  assert.equal(await verifySeal(root),true); const m=JSON.parse(await fs.readFile(path.join(root,"evidence-manifest.json"))); assert.ok(m.files["subject-1.runtime-lookalike/evidence"]);
  await fs.writeFile(path.join(root,"subject-1.runtime","cache"),"later"); assert.equal(await verifySeal(root),true);
  await fs.writeFile(path.join(root,"new-evidence"),"late"); await assert.rejects(verifySeal(root),/mismatch/);
  await fs.unlink(path.join(root,"new-evidence")); await fs.unlink(path.join(root,"subject-1.runtime-lookalike","evidence")); await assert.rejects(verifySeal(root),/mismatch/);
});
test("manifest fails on concurrent evidence, tampering and symlink scratch substitutions", async t => {
  const root=await temp(t); await fs.writeFile(path.join(root,"run.json"),'{}');
  await assert.rejects(sealEvidence(root,()=>fs.writeFile(path.join(root,"changed"),"bad")),/snapshot-drift/);
  await assert.rejects(fs.stat(path.join(root,"seal.json")),/ENOENT/);
  await fs.symlink(root,path.join(root,"subject-2.runtime")); await assert.rejects(evidenceFiles(root),/symlink/); await fs.unlink(path.join(root,"subject-2.runtime"));
  await sealEvidence(root); const seal=await fs.readFile(path.join(root,"seal.json"),"utf8"); await fs.writeFile(path.join(root,"evidence-manifest.json"),'{}'); await assert.rejects(verifySeal(root)); assert.equal(await fs.readFile(path.join(root,"seal.json"),"utf8"),seal);
});
test("approval consumption is exclusive and rejects obsolete or expanded approval before writes", async t => {
  const root=await temp(t),p=plan(),a={status:"approved",work_item_id:"WI-0210",approved_by:"human",evidence_ref:".ai-org/artifacts/WI-0210/design.md",protocol_sha256:digest(p),limits,policy:p.policy};
  await assert.rejects(consumeApproval(root,p,{...a,work_item_id:"WI-0208"})); await assert.rejects(fs.stat(path.join(root,"consumed.json")),/ENOENT/);
  await consumeApproval(root,p,a); await assert.rejects(consumeApproval(root,p,a),/EEXIST/);
});
test("sealed Git containment accepts a lab alias and rejects canonical siblings", async t => {
  const parent = await temp(t), lab = path.join(parent, "lab"), alias = path.join(parent, "alias");
  await fs.mkdir(lab); await fs.symlink(lab, alias);
  const subject = path.join(await fs.realpath(lab), "subject"); await fs.mkdir(subject);
  execFileSync("git", ["init", "-q", subject]);
  await fs.writeFile(path.join(lab,"protocol.json"), JSON.stringify({subjects:[{root:subject}]}));
  await fs.writeFile(path.join(lab,"run.json"), JSON.stringify({git_safety:[{subject:1,sha256:await gitSafety(subject)}]}));
  await sealEvidence(alias); assert.equal(await verifySeal(alias),true);
  const outside = path.join(parent,"outside"); await fs.mkdir(outside);
  await fs.writeFile(path.join(lab,"protocol.json"),JSON.stringify({subjects:[{root:outside}]}));
  // Make a distinct fixture with truthful hashes; containment must still fail.
  await fs.unlink(path.join(lab,"seal.json")); await fs.unlink(path.join(lab,"evidence-manifest.json"));
  await assert.rejects(sealEvidence(alias), /sealed-subject-path/);
});
test("finalization failure records a separate sidecar and never changes sealed bytes", async t => {
  const parent=await temp(t),lab=path.join(parent,"lab");await fs.mkdir(lab);
  const result={status:"stopped",stop_reason:"argument-shape",elapsed_ms:123};
  await fs.writeFile(path.join(lab,"run.json"),JSON.stringify(result));
  const before=await fs.readFile(path.join(lab,"run.json"));
  const returned=await finalizeEvidence(lab,result,async root=>{await sealEvidence(root);throw Error("sealed-subject-path");});
  assert.equal(returned.archive_failure,true);assert.equal(returned.stop_reason,"argument-shape");
  assert.equal(returned.archive_failure_code,"sealed-subject-path");
  assert.deepEqual(await fs.readFile(path.join(lab,"run.json")),before);
  assert.equal(await verifySeal(lab),true);assert.equal(result.archive_failure,undefined);
  assert.equal(JSON.parse(await fs.readFile(lab+".archive-failure.json")).archive_failure,true);
  await assert.rejects(finalizeEvidence(lab,result,async()=>{throw Error("again");}),/EEXIST/);
});
test("matrix wrapper runs exactly twelve ordered stages and stops retaining partial usage", async () => {
  const record={candidate_revision:"fixture",test_command:"node --test test/*.test.mjs",test_exit_code:0,decision:"accept",unresolved:[]};
  const observe=(s,stage)=>({arm:s.arm,stage,status:"completed",provider_exit_confirmed:true,usage:{operational_tokens:100},completion:record,events:[{method:"item/completed",item_type:"commandExecution",exit_code:0,classification:{allowed:true,operation:"temple-context-enter"},entry_eligible:true,task_material:{material:"task"}},{method:"item/completed",item_type:"commandExecution",exit_code:0,classification:{allowed:true,operation:"temple-finish",dry_run:false},finish_current_passed:true}]});
  const initial=()=>({status:"running",stages:[],attempted_stages:0,operational_tokens:0});
  const make=(overrides={})=>({deadline:100,now:()=>0,beforeStage:async()=>({}),runOne:async(s,stage)=>observe(s,stage),assessOne:async()=>({record,quality_passed:true,workflow:{pass:true,exact_handoff:true}}),persist:async()=>{},...overrides});
  const r=initial();await executeMatrix(plan(),r,make());assert.equal(r.status,"completed");assert.equal(r.operational_tokens,1200);assert.deepEqual(r.stages.map(s=>s.variant),schedule.flatMap(s=>[s,s]));
  for(const reason of ["forbidden-item","provider-shutdown-unconfirmed","runtime-request"]){const r=initial();await assert.rejects(executeMatrix(plan(),r,make({runOne:async(s,stage)=>r.attempted_stages===3?{...observe(s,stage),status:"stopped",stop_reason:reason}:observe(s,stage)})),new RegExp(reason));assert.equal(r.attempted_stages,3);assert.equal(r.stages.length,3);assert.equal(r.operational_tokens,300);}
  const r2=initial();await assert.rejects(executeMatrix(plan(),r2,make({now:()=>100})),/aggregate-limit/);assert.equal(r2.attempted_stages,0);
  const r3=initial();await assert.rejects(executeMatrix(plan(),r3,make({beforeStage:async()=>{throw Error("fixture-drift")}})),/fixture-drift/);assert.equal(r3.attempted_stages,0);
  const r4=initial();await assert.rejects(executeMatrix(plan(),r4,make({runOne:async(s,stage)=>({...observe(s,stage),usage:{operational_tokens:80001}})})),/token-limit/);assert.equal(r4.stages.length,1);assert.equal(r4.operational_tokens,80001);
  const r5=initial();await assert.rejects(executeMatrix(plan(),r5,make({assessOne:async()=>({record,quality_passed:false,workflow:null})})),/noncomparable/);assert.equal(r5.attempted_stages,1);
});
test("diagnostic metadata separates schema-defined denied types from unknown payloads", () => {
  const contract={schemas:{ItemStartedNotification:{definitions:{ThreadItem:{oneOf:[{properties:{type:{enum:["mcpToolCall"]}}}]}}}}};
  for (const method of ["item/started","item/completed"]) {
    for(const type of ["mcpToolCall","private/path/secret",undefined]){
      const item={type,id:"item",arguments:"private payload"}; const rule=eventViolation({method,params:{item}},{});assert.equal(rule,"forbidden-item");
      const d=itemDiagnostics(item,{allowed:false,rule},contract);assert.equal(d.observed_item_type,type==="mcpToolCall"?type:type===undefined?"missing":"unknown");assert.ok(!JSON.stringify(d).includes("private"));assert.equal(d.rejection_rule,"forbidden-item");
    }
  }
});
test("runtime opt-in retains denied metadata and does not swallow shutdown failure", async t => {
  const lab=await temp(t),root=path.join(lab,"repo");await fs.mkdir(root);
  const schema={definitions:{ThreadItem:{oneOf:[{properties:{type:{enum:["mcpToolCall"]}}}]}}};
  const contract={schemas:{ItemStartedNotification:schema,ItemCompletedNotification:{},ThreadTokenUsageUpdatedNotification:{},ThreadStartParams:{},TurnStartParams:{}}};
  for(const mode of ["denied","shutdown"]){
    const factory=(_p,_a,o)=>({notify(){},async close(){if(mode==="shutdown")throw Error("private shutdown details")},async request(method){
      if(method==="config/read")return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
      if(method==="thread/start")return {thread:{id:"thread"},model:"gpt-5.6-terra",reasoningEffort:"medium"};
      if(method==="turn/start"){
        setTimeout(()=>{const emit=(method,params)=>o.onNotification({method,params:{threadId:"thread",turnId:"turn",...params}});
          emit("thread/tokenUsage/updated",{tokenUsage:{total:{inputTokens:100,cachedInputTokens:40,outputTokens:20,reasoningOutputTokens:5,totalTokens:120}}});
          if(mode==="denied")emit("item/started",{item:{type:"mcpToolCall",id:"private-id",arguments:"private payload"}});
          else {emit("item/completed",{item:{type:"agentMessage",id:"message",text:JSON.stringify({candidate_revision:"fixture",test_command:"node --test test/*.test.mjs",test_exit_code:0,decision:"delivered",summary:"fixture",unresolved:[]})}});emit("turn/completed",{turn:{id:"turn",status:"completed"}});}
        },0);return {turn:{id:"turn"}};
      }
      if(method==="turn/interrupt")o.onNotification({method:"turn/completed",params:{threadId:"thread",turnId:"turn",turn:{id:"turn",status:"interrupted"}}});
      return {};
    }});
    const o=await runStage({root,arm:"ordinary",stage:"build",protocol:plan(),contract,sourceRoot:root,providerFactory:factory,deadline:Date.now()+5000,aggregateBefore:0,diagnosticKey:"fixture",runtimePolicy:{arguments:[],beforeStart(){},checkConfig(){}}});
    assert.equal(o.status,"stopped");assert.equal(o.stop_reason,mode==="denied"?"forbidden-item":"provider-shutdown-unconfirmed");assert.equal(o.usage.operational_tokens,80);
    if(mode==="denied")assert.ok(o.events.some(e=>e.observed_item_type==="mcpToolCall"&&e.rejection_rule==="forbidden-item"));
    assert.ok(!JSON.stringify(o).includes("private"));
  }
});
test("ordinary/prior prompts are unchanged; slim binds actual source hashes and preserves mandatory reading", async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "context-prompt-")); t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "AGENTS.md"), "required agent rules\n"); await fs.writeFile(path.join(root, "TEMPLE.md"), "required temple rules\n");
  for (const stage of ["build", "verify"]) {
    const args = { root, arm: "ordinary", stage, protocol: plan() };
    assert.deepEqual(requestsFor("ordinary", args), stageRequests(args));
    args.arm = "temple"; assert.deepEqual(requestsFor("prior", args), stageRequests(args));
    const slim = requestsFor("slim", args), text = slim.turn.input[0].text;
    assert.ok(text.includes(digest("required agent rules\n")) && text.includes(digest("required temple rules\n")));
    assert.match(text, /actually read the complete AGENTS.md and TEMPLE.md/); assert.match(text, /omit --available-whole-sources/);
    assert.match(text, /--material task/); assert.match(text, /node --test test\/\*\.test\.mjs/);
    assert.deepEqual(slim.thread, stageRequests(args).thread); assert.deepEqual(slim.turn.outputSchema, stageRequests(args).turn.outputSchema);
  }
});
test("material command policy is opt-in and does not loosen identity, path or malformed declaration boundaries", async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "context-command-")); t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "templew.mjs"), "// fixture\n");
  const base = "node ./templew.mjs context enter . --work-item WI-0001 --position developer --agent-id agent-builder --principal-id human --no-write --json";
  const ctx = { root, arm: "temple", stage: "build" };
  const check = (command, opts = {}) => classifyCommandItem({ type: "commandExecution", id: "command-1", status: "inProgress", command, cwd: root, commandActions: [] }, { ...ctx, ...opts });
  assert.equal(check(base).allowed, true); assert.equal(check(base + " --material task").allowed, false);
  assert.equal(check(base + " --material task", { contextMaterial: true }).allowed, true);
  const declared = JSON.stringify([{ path: "AGENTS.md", sha256: digest("body") }]);
  assert.equal(check(base + ` --material task --available-whole-sources '${declared}'`, { contextMaterial: true }).allowed, true);
  for (const rows of [[{ path: "../AGENTS.md", sha256: digest("body") }], [{ path: "AGENTS.md", sha256: [digest("body")] }], [{ path: "AGENTS.md", sha256: digest("body"), extra: true }], [JSON.parse(declared)[0], JSON.parse(declared)[0]]]) assert.equal(check(base + ` --available-whole-sources '${JSON.stringify(rows)}'`, { contextMaterial: true }).allowed, false);
  for (const cmd of [base + " --material full", base + " --material task --material task", base.replace("agent-builder", "agent-verifier") + " --material task", base.replace("WI-0001", "WI-0002") + " --material task"]) assert.equal(check(cmd, { contextMaterial: true }).allowed, false);
});
