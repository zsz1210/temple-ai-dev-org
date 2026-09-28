import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readNativeTask} from '../src/workkeel-tasks.mjs';
import {readTaskProject,assertActor,assertApprover} from '../src/workkeel-project.mjs';
import {exactKeys} from '../src/workkeel-execution-policy.mjs';

const FIELDS={claim:[],handoff:['summary','evidence','unresolved'],review:['judgment','summary','evidence'],close:['summary','rollback','evidence']};
const STATE={claim:'intake',handoff:'build',review:'test',close:'release_gate'};
const ID=/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/;
const sameActor=(a,b)=>a.agent_id===b.agent_id&&a.principal_id===b.principal_id;
const text=value=>{if(typeof value!=='string'||!value.trim()||value.length>8000)throw Error('Delivery: bounded nonempty decision text required');};

/** Operation-specific input contract, not permission or a successful decision. */
export function deliveryOperationGuide(state,review) {
  const action=state==='intake'?'claim':state==='build'?'handoff':state==='test'&&!review?'review':state==='release_gate'?'close':null;
  return {action,input_fields:action?['task_id','action','actor','operation_id',...FIELDS[action]]:[],
    instructions:action?{
      claim:'Read the approved contract and required project instructions; confirm the current Git base before applying.',
      handoff:'Commit and verify the exact candidate. Supply actual evidence and an explicit empty unresolved list only when work is ready.',
      review:'The actual distinct reviewer inspects the delivered candidate and supplies its own judgment, summary and evidence.',
      close:'The authorized approver supplies the acceptance summary, rollback and evidence after independent review.'
    }[action]:'No supported preparation step; inspect the current task for explicit rework, cancellation or completed status.',
    required_reading:['Project instructions and WORKKEEL.md','Approved task contract and its referenced authority','Evidence needed for the current operation'],
    reference:'docs/operations/workkeel-native-dispatch.md#prepare-a-lifecycle-request'};
}

/** Fill mechanical fields only. The native mutation API remains the final gate. */
export async function prepareDeliveryRequest(target,input) {
  if(!input||!Object.hasOwn(FIELDS,input.action))throw Error('Delivery: unsupported preparation action');
  const {action}=input;
  exactKeys(input,['task_id','action','actor','operation_id',...FIELDS[action]]);
  if(typeof input.operation_id!=='string'||!ID.test(input.operation_id))throw Error('Delivery: explicit operation ID required');
  const task=await readNativeTask(target,input.task_id),project=await readTaskProject(target);
  assertActor(project.policy,input.actor);
  if(task.history.some(row=>row.operation_id===input.operation_id))throw Error('Delivery: operation ID already recorded; inspect history and retry the original saved request');
  if(task.state!==STATE[action])throw Error('Delivery: operation does not match current task stage');
  if(action==='claim'&&(task.claim||!sameActor(input.actor,task.contract.actor)))throw Error('Delivery: approved unclaimed task actor required');
  if(action==='handoff'&&(!task.claim||!sameActor(input.actor,task.claim.actor)))throw Error('Delivery: current matching implementation claim required');
  if(action==='review') {
    if(!task.delivery||task.review)throw Error('Delivery: candidate is not awaiting review');
    const implementer=task.delivery.implementer;
    if(input.actor.agent_id===implementer.agent_id||task.contract.verification.separation==='distinct-principal'&&input.actor.principal_id===implementer.principal_id)throw Error('Delivery: reviewer separation required');
    if(!['pass','fail'].includes(input.judgment))throw Error('Delivery: actual review judgment required');
  }
  if(action==='close') {
    assertApprover(project.policy,input.actor);
    if(!task.delivery||task.review?.judgment!=='pass'||task.review.revision!==task.delivery.revision)throw Error('Delivery: exact passing review required');
  }
  for(const field of ['summary','rollback'])if(Object.hasOwn(input,field))text(input[field]);
  if(Object.hasOwn(input,'evidence')&&(!Array.isArray(input.evidence)||!input.evidence.length||input.evidence.some(ref=>typeof ref!=='string'||!ref.trim())))throw Error('Delivery: explicit evidence references required');
  if(action==='handoff'&&(!Array.isArray(input.unresolved)||input.unresolved.length))throw Error('Delivery: resolve outstanding issues before preparing handoff');
  const request={operation_id:input.operation_id,expected_version:task.version,actor:{...input.actor}};
  if(action==='claim'||action==='handoff') {
    const {stdout}=await promisify(execFile)('git',['-C',target,'rev-parse','--verify','HEAD'],{maxBuffer:4096,timeout:5000});
    const revision=stdout.trim();
    if(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(revision))throw Error('Delivery: exact Git revision required');
    if(action==='claim')request.base_revision=revision;
    else {request.claim_id=task.claim.id;request.revision=revision;}
  } else request.revision=task.delivery.revision;
  for(const field of FIELDS[action])request[field]=Array.isArray(input[field])?[...input[field]]:input[field];
  return {schema_version:'workkeel.delivery-request/v1',authority:'observation-only',mutation_status:'no-write',execution_authorized:false,
    task_id:task.id,action,request,validation_status:'native-apply-required',
    limitations:['Save and inspect request before using the existing native task command; preparation does not perform the operation.',
      'Native apply rechecks authority, version, candidate, scope, evidence, dependencies and reviewer separation. A prepared request is not verification or acceptance.',
      'Do not regenerate after an uncertain write. Inspect history and replay the identical saved request; changed input requires a new operation ID.']};
}
