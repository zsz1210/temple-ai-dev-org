// Future experiment contract only. No historical result migration or model calls.
import Ajv from 'ajv';
import {continuityRequests} from './continuity-codex-adapter.mjs';

export const deliveryProtocol = 'continuity-approved/v4';
export const deliveryContinuation = Object.freeze({product_failure:true,local_invalid:false});
export const deliveryCompletion = {
  type:'object', additionalProperties:false,
  required:['candidate_revision','test_command','test_exit_code','completed','blockers','next_owner','not_performed'],
  properties:{
    candidate_revision:{anyOf:[{type:'string',pattern:'^[a-f0-9]{40}$'},{type:'null'}]},
    test_command:{type:'string',maxLength:4096}, test_exit_code:{type:['integer','null']},
    completed:{type:'string',maxLength:8192},
    blockers:{type:'array',maxItems:32,items:{type:'string',minLength:1,maxLength:2048}},
    next_owner:{enum:['quality_evaluator','reviewer',null]},
    not_performed:{type:'array',maxItems:32,items:{type:'string',minLength:1,maxLength:2048}}
  }
};
const validate = new Ajv({strict:false}).compile(deliveryCompletion);

export function deliveryRequests(subject) {
  const r=continuityRequests(subject);
  r.schema_version='continuity-request-preview/v2';
  r.common_instructions=r.common_instructions.replace('and unresolved issues','and actual blockers');
  if(subject.arm==='temple') r.governance_instructions=
    `You are ${subject.agentId}, Developer for ${subject.itemId}, Principal human. Preserve native instructions and bootstrap obligations. For this known Work Item, use compact context resolve first and read the required routed authority and applicable temple-work Skill. Reuse only already-read unchanged material still available in this session; read TEMPLE.md for missing authority, new work or recovery. Claim before editing. Use the effective Lean Build route without changing its profile: record current candidate/test evidence under .ai-org/artifacts/${subject.itemId}/, call work-item finish once and inspect its mutation and diagnostics. Read the Lean execution reference, not both completion recipes. context enter is optional, not a finish prerequisite. Do not repeat successful Status/Doctor on unchanged state, create duplicate handoff reports or run later Verifier, Independent QA or Release Gate work.`;
  if(subject.arm==='temple')r.governance_instructions+=' Cite the tested product SHA in the evidence and finish request. Commit the resulting delivery records separately; still report that tested product SHA as candidate_revision, not the later record commit. Do not alter product or tests after the tested candidate.';
  const reporting=`Report actual defects, risks or blocked decisions in blockers (empty only if none). Set next_owner to ${subject.arm==='temple'?'quality_evaluator':'reviewer'} after completing this stage, or null when unavailable. List downstream work not performed in not_performed; those declarations are not acceptance. Never hide a real blocker as downstream work. Use null for an unavailable candidate or test result; never invent evidence.`;
  r.turn.input=[{type:'text',text:r.common_instructions+'\n\n'+r.governance_instructions+'\n\n'+reporting}];
  r.turn.outputSchema=structuredClone(deliveryCompletion);
  return r;
}

export function assessDeliveryCompletion(completion,{oraclePassed,arm}={}) {
  if(!['ordinary','temple'].includes(arm))throw Error('invalid-arm');
  const schemaValid=validate(completion);
  const productPassed=oraclePassed===true;
  const handoffValid=Boolean(schemaValid && completion.next_owner===(arm==='temple'?'quality_evaluator':'reviewer'));
  const buildAccepted=Boolean(schemaValid && productPassed && completion.candidate_revision!==null &&
    completion.test_command.trim() && completion.test_exit_code===0 && completion.blockers.length===0);
  return {schema_valid:Boolean(schemaValid),product_passed:productPassed,handoff_valid:handoffValid,
    build_accepted:buildAccepted,accepted:buildAccepted&&handoffValid};
}
