// Experiment-local adaptation of scripts/delivery-control-pair.mjs at 0fc622d.
// Keeps its wire, identity, completion, command and usage validation.
// Adds explicit per-actor write paths, injected requests, aggregate callbacks and cancellation.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import {realpathSync,readFileSync} from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import {createJsonRpcProcess,buildCodexRuntimeRequestResponse} from "../../../src/codex-app-server-provider.mjs";
import {normalizeTokenUsage} from "../../../src/app-server-protocol-replay.mjs";
import {representativeAppServerArguments,representativeNoToolPassiveItemTypes} from "../../../scripts/run-representative-microservice-comparison.mjs";
import {completionSchema,deliveryTempRoot,subprocessEnvironment} from "../../../scripts/delivery-control-pair.mjs";
import {classifyCommandItem} from "./command-policy.mjs";
const completionValidator=new Ajv().compile(completionSchema);
function requireThat(value,message){if(!value)throw Error(message);}
function within(root,candidate){const relative=path.relative(root,candidate);return relative===""||(!relative.startsWith("..")&&!path.isAbsolute(relative));}
function canonical(file){try{return realpathSync(file);}catch{return path.join(canonical(path.dirname(file)),path.basename(file));}}
function memoryCheck(config){requireThat(config?.config?.memories?.use_memories===false&&config?.config?.memories?.generate_memories===false&&config?.config?.features?.memories===false,"memory-isolation");}
function schemaCheck(schema,value){const v=new Ajv({strict:false,validateFormats:false}).compile(schema);requireThat(v(value),"provider-wire-schema:request");}
const passiveTypes = new Set(representativeNoToolPassiveItemTypes);
const itemTypes = new Set([...passiveTypes,"commandExecution","fileChange"]);
const knownMethods = new Set(["configWarning","warning","thread/started","thread/status/changed","turn/started","turn/completed","item/started","item/completed","item/commandExecution/outputDelta","thread/tokenUsage/updated","account/rateLimits/updated","mcpServer/startupStatus/updated","remoteControl/status/changed"]);
const failureCodes = new Set(["model-acknowledgement","effort-acknowledgement","thread-id-missing","turn-id-missing","wrong-thread-event","wrong-turn-event","provider-route-or-approval","provider-terminal","missing-token-usage","invalid-token-usage","usage-regressed","usage-identity-missing","completion-schema","wall-clock-limit","operational-token-limit","provider-protocol","provider-exit","runtime-request","event-count-limit","duplicate-item-start","duplicate-item-completion","completion-without-start","unmatched-item-start","command-outcome-missing","invalid-event-id","invalid-event-shape","command-envelope-changed","memory-isolation","aggregate-wall-clock-limit","source-drift","git-safety-drift","arm-initial-state-drift","write-scope","public-file-changed","verifier-product-write","symlink","candidate-revision","delivery-record-schema","test-command-claim","test-result-mismatch","actor-test-execution-unobserved","verifier-revision","handoff-evidence","incorrect-verifier-acceptance","completion-file-disagreement","installed-provider-drift","synthetic-review-required"]);
export function safeFailureCode(error) {
  const value=typeof error === "string" ? error : error?.message;
  if (failureCodes.has(value)) return value;
  for (const prefix of ["provider-wire-schema","write-scope","public-file-changed","candidate-content","product-test-write-scope","symlink"]) if (typeof value === "string" && value.startsWith(prefix+":")) return prefix;
  return "observation-invalid";
}
function eventDecision(message, context) {
  const p=message?.params??{};
  if (p.threadId && context.threadId && p.threadId !== context.threadId) return {allowed:false,rule:"wrong-thread-event"};
  if (p.turnId && context.turnId && p.turnId !== context.turnId) return {allowed:false,rule:"wrong-turn-event"};
  if (/rerout|requestApproval|requestUserInput/i.test(message?.method??"")) return {allowed:false,rule:"provider-route-or-approval"};
  if (!["item/started","item/completed"].includes(message?.method)) return {allowed:true,rule:"not-item"};
  const item=p.item;
  if (!item || !itemTypes.has(item.type)) return {allowed:false,rule:"forbidden-item"};
  if (item.type === "commandExecution") return classifyCommandItem(item,context);
  if (item.type !== "fileChange") return {allowed:true,rule:"passive-item"};
  if (!Array.isArray(item.changes)||!item.changes.length||item.changes.length>16) return {allowed:false,rule:"malformed-file-change"};
  for (const change of item.changes) {
    if (typeof change.path!=="string"||change.path.length>4096||!within(canonical(context.root),canonical(path.resolve(context.root,change.path)))) return {allowed:false,rule:"file-path-escape"};
    const relative=path.relative(canonical(context.root),canonical(path.resolve(context.root,change.path)));
    if (!context.writePaths.includes(relative)) return {allowed:false,rule:"file-write-scope"};
    if (change.kind?.move_path) {
      const target=canonical(path.resolve(context.root,change.kind.move_path));
      if (!within(canonical(context.root),target)||!context.writePaths.includes(path.relative(canonical(context.root),target))) return {allowed:false,rule:"file-write-scope"};
    }
  }
  return {allowed:true,rule:"scoped-patch"};
}
export function eventViolation(message,context) { const d=eventDecision(message,context); return d.allowed?null:d.rule; }
function allowedPatch(name, stage, arm) { return (stage === "build" ? ["order.mjs", "test/added.test.mjs", "DELIVERY.json", "HANDOFF.md"] : ["VERIFICATION.json"]).includes(name) || (arm === "temple" && /^\.ai-org\/artifacts\/WI-0001\/[^/]+\.(?:md|json)$/.test(name)); }
function allowedWrite(name, stage, arm) { return allowedPatch(name, stage, arm) || (arm === "temple" && ([".ai-org/events/events.jsonl", ".ai-org/work-items/WI-0001.json", ".ai-org/project/evidence.json"].includes(name) || name.startsWith(".ai-org/views/"))); }
function usageValue(params) { const u = normalizeTokenUsage(params); requireThat(u && u.cached_input_tokens <= u.input_tokens && u.reasoning_output_tokens <= u.output_tokens && u.total_tokens === u.input_tokens + u.output_tokens, "invalid-token-usage"); return { ...u, non_cached_input_tokens: u.input_tokens - u.cached_input_tokens, operational_tokens: u.input_tokens - u.cached_input_tokens + u.output_tokens }; }

export async function runStage({ root, arm = "ordinary", stage, protocol, contract, sourceRoot, providerFactory = createJsonRpcProcess, deadline, aggregateBefore = 0, diagnosticKey, expectedClaimRevision, requests: requestOverride, writePaths, onUsage = () => {}, signal }) {
  const start = Date.now(), hash = value => "hmac-sha256:" + crypto.createHmac("sha256", diagnosticKey).update(String(value)).digest("hex");
  const observation = { arm, stage, status: "stopped", usage: null, usage_finality: "last-observed-not-account-final", usage_observed_at_ms: null, command_count: 0, command_started_count: 0, command_completed_count: 0, patch_started_count: 0, patch_completed_count: 0, tool_count: 0, reported_output_bytes: 0, events: [], observed_test_exit_codes: [], requested_model: protocol.model, acknowledged_model: null, model_acknowledgement: "not-observed", requested_effort: protocol.reasoning_effort, observed_thread_effort: null, effective_turn_effort: null, terminal_status: null, interrupt_requested: false, interrupt_acknowledged: false, retry_count: 0, fallback_count: 0 };
  let connection, threadId, turnId, completion, terminal, stop, turnStart, wake, abort, interruptPromise, closing = false, terminalWake;
  const terminalDone = new Promise(resolve => { terminalWake = resolve; });
  const pending = [], started = new Map(), completed = new Set();
  const wireValidators=Object.fromEntries([['item/started','ItemStartedNotification'],['item/completed','ItemCompletedNotification'],['thread/tokenUsage/updated','ThreadTokenUsageUpdatedNotification']].map(([method,name])=>[method,new Ajv({strict:false,validateFormats:false}).compile(contract.schemas[name])]));
  observation.model_acknowledgement_basis="unknown"; observation.turn_start_requested=false;
  const validId = value => typeof value === "string" && value.length > 0 && value.length <= 256;
  const done = new Promise(resolve => { wake = resolve; }), failed = new Promise(resolve => { abort = resolve; });
  const interrupt = () => {
    if (!connection || !threadId || !turnId || observation.interrupt_requested) return;
    observation.interrupt_requested = true;
    interruptPromise = Promise.resolve().then(() => connection.request("turn/interrupt", { threadId, turnId }, 250)).then(() => { observation.interrupt_acknowledged = true; }, () => {});
  };
  const fail = reason => { stop ??= reason; interrupt(); abort(); wake(); };
  const context = () => {
    const read = name => { try { const file=path.join(root,name); if (!within(canonical(root),canonical(file))) return null; return JSON.parse(readFileSync(file,"utf8")); } catch { return null; } };
    return {writePaths,root,arm,stage,threadId,turnId,expectedClaimRevision,expectedClaimId:read(".ai-org/work-items/WI-0001.json")?.claim?.id,expectedCandidateRevision:read("DELIVERY.json")?.candidate_revision,verificationDecision:read("VERIFICATION.json")?.decision};
  };
  const processEvent = message => {
    // A stop does not close observation: correlated trailing counters and the
    // interrupted terminal may arrive while the one interrupt is acknowledged.
    // fail() preserves the first stop; observation never resumes the actor turn.
    if (closing) return;
    try {
      requireThat(message && typeof message.method === "string" && message.params && typeof message.params === "object", "invalid-event-shape");
      const p=message.params, item=p.item, method=message.method;
      const decision=eventDecision(message,context());
      if (observation.events.length >= 2000) { fail("event-count-limit"); return; }
      const event={method:knownMethods.has(method)?method:"unrecognized",item_type:itemTypes.has(item?.type)?item.type:null,item_id:validId(item?.id)?hash(item.id):null,exit_code:Number.isInteger(item?.exitCode)?item.exitCode:null};
      if (item?.type === "commandExecution" && method === "item/started") { observation.command_count++; observation.command_started_count++; }
      if (item?.type === "commandExecution" && method === "item/completed") observation.command_completed_count++;
      if (item?.type === "fileChange" && method === "item/started") observation.patch_started_count++;
      if (item?.type === "fileChange" && method === "item/completed") observation.patch_completed_count++;
      if (item?.type === "commandExecution") Object.assign(event,{classification:decision,command_digest:hash(item.command),
        output_bytes: method === "item/completed" && typeof item.aggregatedOutput === "string" ? Buffer.byteLength(item.aggregatedOutput) : null});
      observation.events.push(event);
      if (!decision.allowed) { fail(decision.rule); return; }
      if (wireValidators[method]) requireThat(wireValidators[method](p),"provider-wire-schema:notification");
      const relevant=["item/started","item/completed","thread/tokenUsage/updated","turn/started","turn/completed"].includes(method);
      if (relevant) {
        requireThat(p.threadId === threadId,"wrong-thread-event");
        const eventTurn=method.startsWith("turn/")?p.turn?.id:p.turnId;
        requireThat(eventTurn === turnId,"wrong-turn-event");
      }
      if (method === "thread/tokenUsage/updated") {
        const next=usageValue(p);
        requireThat(!observation.usage || ["input_tokens","cached_input_tokens","output_tokens","reasoning_output_tokens","total_tokens"].every(key=>next[key] >= observation.usage[key]),"usage-regressed");
        onUsage(next); observation.usage=next; observation.usage_observed_at_ms=Date.now()-start;
        if (next.operational_tokens > protocol.limits.per_stage_operational_tokens || aggregateBefore+next.operational_tokens > protocol.limits.aggregate_operational_tokens) fail("operational-token-limit");
      }
      if (["item/started","item/completed"].includes(method)) {
        requireThat(validId(item?.id),"invalid-event-id");
        const tool=["commandExecution","fileChange"].includes(item.type);
        if (tool) {
          const fingerprint=hash(item.type === "commandExecution"?JSON.stringify([item.command,item.cwd]):JSON.stringify(item.changes));
          if (method === "item/started") {
            requireThat(!started.has(item.id),"duplicate-item-start");
            requireThat(item.status === "inProgress","invalid-event-shape");
            started.set(item.id,{type:item.type,fingerprint}); observation.tool_count++;
          } else {
            requireThat(started.has(item.id),"completion-without-start");
            requireThat(!completed.has(item.id),"duplicate-item-completion");
            requireThat(started.get(item.id).fingerprint === fingerprint && started.get(item.id).type === item.type,"command-envelope-changed");
            requireThat(["completed","failed","declined"].includes(item.status),"invalid-event-shape");
            if (item.type === "commandExecution") {
              requireThat(Number.isInteger(item.exitCode),"command-outcome-missing");
              if (decision.operation === "product-tests-all") observation.observed_test_exit_codes.push(item.exitCode);
            }
            completed.add(item.id);
          }
        }
        if (method === "item/completed") {
          observation.reported_output_bytes += Buffer.byteLength(typeof item.aggregatedOutput === "string"?item.aggregatedOutput:typeof item.text === "string"?item.text:"");
          if (item.type === "agentMessage") completion=item.text;
        }
      }
      if (method === "turn/completed") {
        terminal=p.turn;
        terminalWake();
        observation.terminal_status=["completed","interrupted","failed"].includes(terminal?.status)?terminal.status:"unknown";
        requireThat(started.size === completed.size,"unmatched-item-start");
        wake();
      }
    } catch (error) { fail(safeFailureCode(error)); }
  };
  const onNotification = message => {
    // Turn notifications can precede the turn/start response. Correlate against
    // its authoritative ID before recording usage or claiming an outcome.
    if (turnStart && !turnId) { if (pending.length >= 2000) fail("event-count-limit"); else pending.push(message); return; }
    processEvent(message);
  };
  const cancel = () => fail("aggregate-wall-clock-limit");
  signal?.addEventListener("abort", cancel, {once:true});
  if (signal?.aborted) cancel();
  const timer=setTimeout(()=>fail("wall-clock-limit"),Math.max(1,Math.min(protocol.limits.per_stage_ms,deadline-start)));
  try {
    await fs.mkdir(deliveryTempRoot(root,stage),{recursive:true});
    connection=providerFactory("codex",representativeAppServerArguments,{cwd:root,env:subprocessEnvironment({TEMPLE_CLI_PATH:path.join(sourceRoot,"bin/temple.mjs"),TMPDIR:deliveryTempRoot(root,stage)}),onNotification,
      onRequest(message,responder) { try { responder.respond(buildCodexRuntimeRequestResponse(message.method,message.params,{decision:"decline"})); } catch {} fail("runtime-request"); },
      onProtocolError() { fail("provider-protocol"); }, onExit() { if (!terminal && !closing) fail("provider-exit"); }
    });
    const request=(method,params)=>Promise.race([connection.request(method,params,Math.max(1,deadline-Date.now())),failed.then(()=>{throw Error(stop);})]);
    await request("initialize",{clientInfo:{name:"delivery-pair",version:"2"},capabilities:{experimentalApi:false}}); connection.notify("initialized",{});
    memoryCheck(await request("config/read",{cwd:root,includeLayers:false}));
    const requests=requestOverride; schemaCheck(contract.schemas.ThreadStartParams,requests.thread);
    const thread=await request("thread/start",requests.thread); threadId=thread?.thread?.id;
    observation.acknowledged_model=/^gpt-[a-z0-9.-]{1,64}$/.test(thread?.model??"")?thread.model:null;
    observation.model_acknowledgement=typeof thread?.model !== "string"?"missing":thread.model === protocol.model?"matched":"mismatched";
    observation.model_acknowledgement_basis=observation.acknowledged_model?"direct-response-field":"unknown";
    observation.observed_thread_effort=["none","minimal","low","medium","high","xhigh","max","ultra"].includes(thread?.reasoningEffort)?thread.reasoningEffort:null;
    requireThat(validId(threadId),"thread-id-missing");
    requireThat(thread.model === protocol.model,"model-acknowledgement");
    if (thread.reasoningEffort != null) requireThat(thread.reasoningEffort === protocol.reasoning_effort,"effort-acknowledgement");
    requests.turn.threadId=threadId; schemaCheck(contract.schemas.TurnStartParams,requests.turn); turnStart=Date.now();
    observation.turn_start_requested=true;
    const turn=await request("turn/start",requests.turn); turnId=turn?.turn?.id; requireThat(validId(turnId),"turn-id-missing");
    for (const event of pending) processEvent(event); pending.length=0; if (stop) interrupt();
    await done; requireThat(!stop,stop); requireThat(terminal?.id === turnId && terminal.status === "completed","provider-terminal");
    requireThat(observation.usage,"missing-token-usage");
    let parsed; try { parsed=JSON.parse(completion); } catch { throw Error("completion-schema"); }
    requireThat(completionValidator(parsed),"completion-schema"); observation.completion=parsed; observation.status="completed";
  } catch (error) { fail(stop??safeFailureCode(error)); observation.stop_reason=stop; }
  finally {
    signal?.removeEventListener("abort",cancel);
    clearTimeout(timer); if (interruptPromise) await Promise.race([interruptPromise,new Promise(resolve=>setTimeout(resolve,250))]);
    if (observation.interrupt_requested && !terminal) {
      let terminalTimer;
      await Promise.race([terminalDone,new Promise(resolve=>{terminalTimer=setTimeout(resolve,2000);})]);
      clearTimeout(terminalTimer);
    }
    closing=true; await connection?.close().catch(()=>{});
    observation.thread_id=validId(threadId)?hash(threadId):null; observation.turn_id=validId(turnId)?hash(turnId):null;
    observation.unmatched_command_starts=Math.max(observation.command_started_count-observation.command_completed_count,[...started].filter(([id,item])=>item.type === "commandExecution" && !completed.has(id)).length);
    observation.unmatched_patch_starts=Math.max(observation.patch_started_count-observation.patch_completed_count,[...started].filter(([id,item])=>item.type === "fileChange" && !completed.has(id)).length);
    observation.total_elapsed_ms=Date.now()-start; observation.setup_elapsed_ms=(turnStart??Date.now())-start; observation.turn_elapsed_ms=turnStart?Date.now()-turnStart:null;
  }
  return observation;
}


