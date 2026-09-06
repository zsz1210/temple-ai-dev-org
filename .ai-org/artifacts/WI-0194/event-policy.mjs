import { createHash } from 'node:crypto';
const hash = value => createHash('sha256').update(String(value)).digest('hex');

// Each installed ThreadItem kind has an explicit policy. A declared provider
// capability is not permission to use it in this local-only experiment.
export const ITEM_POLICY = Object.freeze({
  userMessage:'observation', hookPrompt:'observation', agentMessage:'observation',
  functionCallOutput:'observation', plan:'observation', reasoning:'observation',
  commandExecution:'tracked', fileChange:'tracked', collabAgentToolCall:'tracked',
  subAgentActivity:'activity', sleep:'tracked', contextCompaction:'observation',
  mcpToolCall:'forbidden', dynamicToolCall:'forbidden', webSearch:'forbidden',
  imageView:'forbidden', imageGeneration:'forbidden',
  enteredReviewMode:'forbidden', exitedReviewMode:'forbidden'
});
const knownType = type => typeof type==='string' && Object.hasOwn(ITEM_POLICY,type);
export const classifyItem = type => knownType(type) ? ITEM_POLICY[type] : 'unknown';
export function assertItemCoverage(schema) {
  const kinds = schema?.definitions?.ThreadItem?.oneOf?.map(x=>x.properties?.type?.enum?.[0]);
  if(!kinds || kinds.some(x=>typeof x!=='string') || new Set(kinds).size!==kinds.length)throw Error('item-schema-shape');
  if(JSON.stringify([...kinds].sort())!==JSON.stringify(Object.keys(ITEM_POLICY).sort()))throw Error('item-schema-drift');
  return kinds;
}

const methods = new Set(['item/started','item/completed','turn/started','turn/completed','thread/tokenUsage/updated']);
const codes = new Set(['unknown-item','forbidden-item','event-shape','event-thread','event-turn','item-id','wrong-turn','unknown-thread','unbound-event-cap','event-cap','child-turn-unbound','unfinished-item','unmatched-completion','duplicate-start','command-drift','invalid-child-activity','unexpected-child-activity','child-activity-limit','nested-or-foreign-spawn','extra-child-turn','child-limit-or-duplicate','child-route-unconfirmed','spawn-outcome']);
const schemaErrors = new Set(['schema-invalid:ItemStartedNotification','schema-invalid:ItemCompletedNotification','schema-invalid:ThreadTokenUsageUpdatedNotification','schema-invalid:TurnStartedNotification','schema-invalid:TurnCompletedNotification']);
function metadata(event) {
  const p=event?.params, type=p?.item?.type, method=event?.method;
  const result={method:methods.has(method)?method:'other',item_type:knownType(type)?type:(type===undefined?null:'unknown'),classification:classifyItem(type)};
  const status=p?.item?.status??p?.turn?.status??p?.item?.kind;
  if(['inProgress','started','interacted','pendingInit','running','completed','failed','interrupted','errored','shutdown','notFound'].includes(status))result.status=status;
  for(const [label,value] of Object.entries({thread:p?.threadId,turn:p?.turnId??p?.turn?.id,item:p?.item?.id,child:p?.item?.agentThreadId}))if(typeof value==='string')result[`${label}_sha256`]=hash(value);
  if(typeof type==='string'&&!knownType(type))result.unknown_type_sha256=hash(type);
  else if(type!==undefined&&!knownType(type))result.invalid_type_category=type===null?'null':Array.isArray(type)?'array':typeof type;
  if(typeof method==='string'&&!methods.has(method))result.other_method_sha256=hash(method);
  return result;
}
export class EventJournal {
  constructor(limit=64){if(!Number.isInteger(limit)||limit<1||limit>256)throw Error('journal-limit');this.limit=limit;this.events=[];this.total=0;this.failure=null;}
  record(event){this.total++;this.events.push(metadata(event));if(this.events.length>this.limit)this.events.shift();}
  fail(event,reason){this.failure??={...metadata(event),code:codes.has(reason)||schemaErrors.has(reason)?reason:'event-contract-violation'};}
  report(){return {total_events:this.total,retained_events:this.events.length,recent:this.events,first_failure:this.failure,raw_content_retained:false};}
}
