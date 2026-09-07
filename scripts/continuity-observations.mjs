// Observation only, never a shell permission check or proof of file consumption.
// Raw commands and outputs are transient inputs, not returned or retained.
export const observationCategories=Object.freeze(['reading','context_navigation','testing','git','administration','diagnostics','editing','unknown']);
const byteCap=2*1024*1024;
export function observedBytes(value) {
  if(typeof value!=='string')return {bytes:null,status:'unavailable'};
  const bytes=Buffer.byteLength(value,'utf8');
  return {bytes:Math.min(bytes,byteCap),status:bytes>byteCap?'capped-lower-bound':'observed-field'};
}
export function classifyObservedCommand(command) {
  if(typeof command!=='string'||command.length>16384)return 'unknown';
  // A deliberately narrow lexical classifier. Shell scripts, substitutions,
  // quoted payloads, pipelines and multiple commands have unknown attribution.
  if(/[;&|<>`$\n\r'"(){}]/.test(command))return 'unknown';
  const words=command.trim().split(/\s+/);
  const executable=words[0]?.split('/').at(-1);
  if(['cat','sed','head','tail','rg','ls','wc'].includes(executable))return 'reading';
  if(executable==='git')return 'git';
  if(executable==='apply_patch')return 'editing';
  if(executable==='node'&&words[1]==='--test')return 'testing';
  if(['npm','pnpm'].includes(executable)&&(['test'].includes(words[1])||words[1]==='run'&&/^verify(?::[a-z-]+)?$/.test(words[2]??'')))return 'testing';
  if(executable==='node'&&words[1]?.split('/').at(-1)==='templew.mjs') {
    if(words[2]==='context')return 'context_navigation';
    if(['doctor','status','observe'].includes(words[2]))return 'diagnostics';
    if(['work-item','handoff','transition','evidence','close'].includes(words[2]))return 'administration';
  }
  return 'unknown';
}

export function createCommandObservations({limit=10000}={}) {
  if(!Number.isSafeInteger(limit)||limit<1||limit>10000)throw Error('invalid-observation-limit');
  const seen=new Set();
  const state={schema_version:'continuity-command-observations/v1',completed_items:0,
    categories:Object.fromEntries(observationCategories.map(k=>[k,0])),observed_output_bytes:0,
    output_bytes_by_category:Object.fromEntries(observationCategories.map(k=>[k,0])),
    output_unavailable:0,output_capped:0,duplicate_events:0,unidentified_events:0,limit_reached:false};
  return {state,accept(item) {
    if(item?.type!=='commandExecution')return;
    if(typeof item.id!=='string'||!item.id||item.id.length>256){state.unidentified_events++;return;}
    if(seen.has(item.id)){state.duplicate_events++;return;}
    if(seen.size>=limit){state.limit_reached=true;return;}
    seen.add(item.id);state.completed_items++;
    const category=classifyObservedCommand(item.command);state.categories[category]++;
    const output=observedBytes(item.aggregatedOutput);
    state.observed_output_bytes+=output.bytes??0;
    state.output_bytes_by_category[category]+=output.bytes??0;
    if(output.status==='unavailable')state.output_unavailable++;
    if(output.status==='capped-lower-bound')state.output_capped++;
  }};
}

export function requestByteObservation(request) {
  // Authored text only. Native instructions, source reads, cached material and
  // provider formatting are not observable here and must not be called zero.
  const text=request.turn?.input?.filter(x=>x.type==='text').map(x=>x.text).join('\n');
  return {schema_version:'continuity-request-bytes/v1',authored_user_text:observedBytes(text),
    authored_developer_text:observedBytes(request.thread?.developerInstructions),
    output_schema:observedBytes(JSON.stringify(request.turn?.outputSchema)),
    native_context_bytes:null,total_model_context_bytes:null};
}
