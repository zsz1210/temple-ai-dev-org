// Optional experiment adapter. Ordinary runActor and its accounting stay unchanged.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createJsonRpcProcess} from '../src/codex-app-server-provider.mjs';
import {assertLiveConfiguration, liveArguments} from './continuity-live-runner.mjs';
import {subprocessEnvironment} from './delivery-control-pair.mjs';
import {assertActorBoundary, limits, usageUpdate} from './autonomy-experiment.mjs';
import {validateBufferedBudget} from './lean-interruption-budget.mjs';

const check = (condition, code) => { if (!condition) throw Error(code); };
const hash = value => createHash('sha256').update(value).digest('hex');
const profile = 'temple-continuity-probe';
const instructions = 'You are executing one authorized bounded local assignment. Use only this repository and native tools. No network, external tools, installations, model fallback, subagents, user questions, background/detached processes, permission changes or other repositories. Use non-login shells and apply_patch for edits. Do not access memories or parent paths. Preserve all supplied requirements and public tests. Runtime tools are on PATH. A final claim is not independent acceptance.';
const completionSchema = {type:'object', additionalProperties:false, required:['decision','summary','findings'], properties:{decision:{type:'string',enum:['pass','fail','blocked']},summary:{type:'string'},findings:{type:'array',items:{type:'string'}}}};

/** Local codex-cli 0.153.4 schema inspection, not a claim about later providers.
 * Neither the interrupted terminal nor the usage notification has a final-accounting
 * marker. Notification ordering, a quiet interval, and repeated equal counters do
 * not prove that cancelled in-flight generation has been accounted for.
 */
export function interruptionAccountingSupport() {
  return {
    status:'blocked', complete_accounting:false,
    reason:'interrupted-final-usage-unobservable', inspected_provider:'codex-cli 0.153.4',
    schema_sha256:{
      ThreadTokenUsageUpdatedNotification:'aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2',
      TurnCompletedNotification:'78af2a37391e8e669a4020cb58593e4d3e378756ced79d5fec72374fa69fb94b',
      TurnInterruptResponse:'531de6be06fe979b5963f249bab82498a175e614bf65ac12fb2e849dfe60bcf1'
    }
  };
}

function relativeFile(root, value) {
  check(typeof value === 'string' && value.length > 0, 'invalid-file-change');
  const absolute = path.resolve(root, value), relative = path.relative(root, absolute);
  check(relative && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative), 'file-change-outside-root');
  return relative;
}

async function durableFiles(root, changes) {
  const canonicalRoot = await fs.realpath(root);
  return Promise.all(changes.map(async change => {
    const absolute = path.resolve(root, change.path);
    const parent = await fs.realpath(path.dirname(absolute));
    check(parent === canonicalRoot || parent.startsWith(canonicalRoot + path.sep), 'file-change-outside-root');
    if (change.kind === 'delete') {
      try { await fs.lstat(absolute); } catch (error) {
        if (error.code === 'ENOENT') return {...change, absent:true};
        throw error;
      }
      throw Error('file-change-not-durable');
    }
    const stat = await fs.lstat(absolute);
    check(stat.isFile() && !stat.isSymbolicLink(), 'file-change-not-durable');
    const bytes = await fs.readFile(absolute);
    return {...change, bytes:bytes.length, sha256:hash(bytes)};
  }));
}

/**
 * Runs only an explicitly opted-in, bounded native qualification probe while this
 * provider lacks final interrupted accounting. Otherwise stops before spawning.
 * shouldInterrupt receives {thread_id,turn_id,item_id,sequence,changes:[{path,kind}]}
 * with root-relative paths, never a diff/command/reasoning body. Its first true
 * result selects a successful patch; disk hashes/absence are verified before the
 * interrupt. The coordinator retains the resulting working tree separately.
 * providerFactory is dependency injection for offline replay tests.
 */
export async function runInterruptedActor(runtime, prompt, {
  tokens, ms, model=limits.model, effort=limits.effort,
  beforeGeneration=async () => {}, onProgress=() => {},
  shouldInterrupt=metadata => metadata.changes.some(change => change.path.startsWith('src' + path.sep)),
  qualificationProbe=false, experimentBudget=null, providerFactory=createJsonRpcProcess
}={}) {
  const started = Date.now();
  const result = {
    status:'stopped', generation_requested:false, first_stop:null, usage:null,
    usage_status:'not-generated', complete_accounting:false,
    accounting_qualification:interruptionAccountingSupport(),
    interruption:{requested:false, acknowledged:false, terminal_confirmed:false, trigger:null},
    commands:0, file_changes:0, events:[],stop_reasons:[]
  };
  if(experimentBudget!==null){
    try{validateBufferedBudget(experimentBudget);check(qualificationProbe===false&&tokens===experimentBudget.phases.initial.stop_tokens&&ms===experimentBudget.phases.initial.stop_ms,'buffered-budget-drift');}
    catch{return {...result,first_stop:'experiment-budget-invalid',elapsed_ms:Date.now()-started,actor_ms:0};}
    result.budget_mode=experimentBudget.id;
  }else if (qualificationProbe !== true) return {...result, first_stop:'interrupted-final-usage-unobservable', elapsed_ms:Date.now()-started, actor_ms:0};
  if (experimentBudget===null&&!(Number.isSafeInteger(tokens) && tokens > 0 && tokens <= 20000 && Number.isSafeInteger(ms) && ms > 0 && ms <= 120000)) {
    return {...result, first_stop:'qualification-budget-invalid', elapsed_ms:Date.now()-started, actor_ms:0};
  }
  let connection, threadId, turnId, usage=null, terminal=null, stop=null, closing=false, finishing=false;
  let turnStart=null, sequence=0, interruptPromise=null, triggerQueue=Promise.resolve();
  const activeItems=new Map();
  let wake, terminalWake;
  const done = new Promise(resolve => { wake=resolve; });
  const terminalDone = new Promise(resolve => { terminalWake=resolve; });
  const halt = reason => { stop ??= reason;if(!result.stop_reasons.includes(reason))result.stop_reasons.push(reason);wake(); };
  const record = (kind, detail={}) => {
    if (result.events.length >= 10000) return halt('event-count-limit');
    result.events.push({sequence:++sequence, kind, ...detail});
  };
  const bounded = async (promise, timeoutMs, code) => {
    let timer;
    try { return await Promise.race([promise, new Promise((_, reject) => { timer=setTimeout(() => reject(Error(code)), timeoutMs); })]); }
    finally { clearTimeout(timer); }
  };
  const interrupt = intentional => {
    if (interruptPromise || terminal || !threadId || !turnId) return interruptPromise;
    result.interruption.requested=true;
    result.interruption.intentional=intentional;
    record('interrupt-requested');
    interruptPromise = connection.request('turn/interrupt', {threadId, turnId}, 3000).then(() => {
      result.interruption.acknowledged=true; record('interrupt-acknowledged');
    }).catch(() => { result.interrupt_unconfirmed=true; halt('interrupt-unconfirmed'); });
    return interruptPromise;
  };
  const consume = message => {
    if (closing) return;
    try {
      const {method, params:p={}}=message;
      if (['model/rerouted','model/verification'].includes(method)) return halt('model-changed');
      if (!['thread/tokenUsage/updated','turn/started','turn/completed','item/started','item/completed'].includes(method)) return;
      check(result.generation_requested && threadId && p.threadId === threadId, 'event-correlation');
      const eventTurn=method.startsWith('turn/') ? p.turn?.id : p.turnId;
      check(typeof eventTurn === 'string' && eventTurn.length > 0 && (!turnId || eventTurn === turnId), 'event-correlation');
      check(!Object.hasOwn(p,'turnId') || p.turnId === eventTurn, 'event-correlation');
      check(!p.turn || !Object.hasOwn(p.turn,'id') || p.turn.id === eventTurn, 'event-correlation');
      turnId ??= eventTurn;
      if (method === 'thread/tokenUsage/updated') {
        usage=usageUpdate(usage,p);
        record('usage-observed', {operational_tokens:usage.operational_tokens, after_terminal:Boolean(terminal)});
        onProgress({operational_tokens:usage.operational_tokens, usage_status:'observed-lower-bound', complete_accounting:false});
        if (usage.operational_tokens >= tokens) halt('token-limit');
        return;
      }
      check(!terminal, 'event-after-terminal');
      if (method === 'turn/completed') {
        check(['completed','interrupted','failed'].includes(p.turn.status), 'invalid-terminal');
        terminal={id:p.turn.id, status:p.turn.status};
        result.interruption.terminal_status=terminal.status;
        result.interruption.terminal_confirmed=terminal.status === 'interrupted';
        record('turn-terminal', {status:terminal.status}); terminalWake(); wake();
        if (terminal.status !== 'interrupted') halt(result.interruption.requested ? 'interrupt-race-completed' : 'completed-before-interrupt');
        else if (!result.interruption.requested) halt('unsolicited-interruption');
        return;
      }
      if (method === 'turn/started') { record('turn-started'); return; }
      const item=p.item;
      check(item && typeof item.id === 'string', 'invalid-item');
      check(['commandExecution','fileChange','userMessage','agentMessage','reasoning','plan'].includes(item.type), 'unexpected-tool-item');
      if (method === 'item/started') {
        check(!activeItems.has(item.id), 'item-correlation');
        activeItems.set(item.id,item.type);
        if (item.type === 'commandExecution') result.commands++;
        if (item.type === 'fileChange') result.file_changes++;
      } else {
        check(activeItems.get(item.id) === item.type, 'item-correlation');
        activeItems.delete(item.id);
      }
      // Keep only successful file-change metadata. Never retain item bodies.
      if (method !== 'item/completed' || item.type !== 'fileChange' || item.status !== 'completed') return;
      check(Array.isArray(item.changes) && item.changes.length > 0, 'invalid-file-change');
      const changes=item.changes.map(change => {
        check(['add','update','delete'].includes(change.kind?.type), 'invalid-file-change');
        // Moves require separate source absence and target evidence; unsupported here.
        check(!change.kind.move_path, 'file-move-unsupported');
        return {path:relativeFile(runtime.root,change.path), kind:change.kind.type};
      });
      record('file-change-completed', {item_id:item.id, changes});
      const metadata={thread_id:threadId,turn_id:turnId,item_id:item.id,sequence,changes};
      triggerQueue=triggerQueue.then(async () => {
        if (finishing || stop || terminal || result.interruption.requested) return;
        const selected=await shouldInterrupt(structuredClone(metadata));
        check(typeof selected === 'boolean', 'invalid-interruption-predicate');
        if (!selected || finishing || stop || terminal || result.interruption.requested) return;
        const files=await durableFiles(runtime.root, changes);
        if (finishing || stop || terminal || result.interruption.requested) return;
        result.interruption.trigger={...metadata, files};
        record('durable-trigger', {item_id:item.id});
        await interrupt(true);
      }).catch(() => halt('interruption-trigger-failed'));
    } catch (error) { halt(/^[a-z-]{1,80}$/.test(error.message) ? error.message : 'protocol-or-callback-failure'); }
  };
  const timer=setTimeout(() => halt('time-limit'), ms), deadline=started+ms;
  try {
    connection=providerFactory(runtime.binary, liveArguments(runtime), {
      cwd:runtime.root,env:subprocessEnvironment(runtime.environment),onNotification:consume,
      onProtocolError:() => halt('protocol-error'),onRequest:() => halt('unexpected-server-request'),
      onExit:() => { if (!closing && !terminal) halt('provider-exit'); }
    });
    const request=async (method, params) => {
      check(!stop,stop); const value=await connection.request(method,params,Math.max(1,deadline-Date.now())); check(!stop,stop); return value;
    };
    await request('initialize',{clientInfo:{name:'temple-interruption-qualification',version:'1'},capabilities:{experimentalApi:true}});
    connection.notify('initialized',{});
    assertLiveConfiguration(await request('config/read',{cwd:runtime.root,includeLayers:false}),runtime);
    check((await request('account/read',{refreshToken:false})).account?.type === 'chatgpt', 'subscription-required');
    const capacity=await request('account/rateLimits/read',{});
    const buckets=Object.values(capacity.rateLimitsByLimitId ?? {}).concat(capacity.rateLimits ? [capacity.rateLimits] : []);
    check(buckets.length && !buckets.some(bucket => [bucket.primary,bucket.secondary].some(window => window?.usedPercent >= 100)), 'subscription-capacity-unavailable');
    const thread=await request('thread/start',{model,cwd:runtime.root,approvalPolicy:'never',permissions:profile,ephemeral:true,allowProviderModelFallback:false,config:{model_reasoning_effort:effort},developerInstructions:instructions});
    threadId=thread.thread?.id;
    check(typeof threadId === 'string', 'invalid-thread');
    assertActorBoundary(thread,runtime.root,{model,effort});
    Object.assign(result,{thread_id:threadId,model:thread.model,effort:thread.reasoningEffort});
    await bounded(Promise.resolve().then(() => beforeGeneration({thread_id:threadId,prompt_sha256:hash(prompt),prompt_bytes:Buffer.byteLength(prompt),developer_bytes:Buffer.byteLength(instructions)})),Math.max(1,deadline-Date.now()),'time-limit');
    check(!stop,stop);
    result.generation_requested=true; turnStart=Date.now();
    const reply=await request('turn/start',{threadId,cwd:runtime.root,model,effort,approvalPolicy:'never',permissions:profile,input:[{type:'text',text:prompt}],outputSchema:completionSchema});
    check(typeof reply.turn?.id === 'string' && (!turnId || turnId === reply.turn.id), 'event-correlation');
    turnId=reply.turn.id;
    await done;
  } catch (error) { halt(/^[a-z-]{1,80}$/.test(error.message) ? error.message : 'provider-or-local-failure'); }
  finally {
    clearTimeout(timer);
    // Closing inhibits delayed predicates from requesting new work during cleanup.
    finishing=true;
    if (connection && threadId && turnId && !terminal) await interrupt(false);
    if (interruptPromise) await interruptPromise;
    if (result.generation_requested && !terminal) {
      try { await bounded(terminalDone,3000,'terminal-unconfirmed'); }
      catch { result.interruption.terminal_unconfirmed=true; halt('terminal-unconfirmed'); }
    }
    if (connection && threadId) {
      try {
        await connection.request('thread/backgroundTerminals/clean',{threadId},5000);
        const left=await connection.request('thread/backgroundTerminals/list',{threadId},5000);
        check(Array.isArray(left.data) && left.data.length === 0 && !left.nextCursor,'cleanup-unconfirmed');
        result.terminals_empty=true; record('terminals-empty');
      } catch { result.cleanup_failure='terminal-cleanup-unconfirmed'; halt('cleanup-unconfirmed'); }
    }
    closing=true;
    try { if (connection) { await connection.close(); result.server_exit_confirmed=true; record('server-exit-confirmed'); } }
    catch { result.cleanup_failure ??= 'server-exit-unconfirmed'; halt('cleanup-unconfirmed'); }
    result.first_stop=stop ?? 'interrupted-final-usage-unobservable';
    result.turn_id=turnId ?? null;
    result.usage=usage;
    result.observed_lower_bound=usage ? {...usage} : null;
    result.usage_status=!result.generation_requested ? 'not-generated' : !usage ? 'unknown' : 'observed-lower-bound';
    result.elapsed_ms=Date.now()-started;
    result.actor_ms=turnStart ? Date.now()-turnStart : 0;
  }
  return result;
}
