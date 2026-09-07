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
  let words=literalWords(command);
  if(!words)return 'unknown';
  if(['/bin/zsh','/bin/bash','/bin/sh','zsh','bash','sh'].includes(words[0])) {
    if(words.length!==3||!['-c','-lc'].includes(words[1]))return 'unknown';
    words=literalWords(words[2]);
    if(!words)return 'unknown';
  }
  const executable=words[0]?.split('/').at(-1);
  // sed scripts can write or execute even without -i. Only plain address + p
  // selection is attributed as reading; all other sed forms remain unknown.
  if(executable==='sed')return words[1]==='-n'&&/^\d+(,\d+)?p$/.test(words[2]??'')&&
    words.length>=4&&words.slice(3).every(w=>!w.startsWith('-'))?'reading':'unknown';
  if(executable==='cat'&&words.length===1)return 'unknown';
  if(executable==='rg'&&words.some(w=>w==='--pre'||w.startsWith('--pre=')))return 'unknown';
  if(['cat','head','tail','rg','ls','wc'].includes(executable))return 'reading';
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

// Observation-only literal recognition. Never execute or grant permission from
// these tokens. Decode at most one native wrapper; scripts/expansion stay unknown.
function literalWords(text) {
  if(!text||/[\x00-\x08\x0a-\x1f\x7f]/.test(text))return null;
  const words=[];let word='',quote=null,present=false;
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(quote==="'"){if(ch==="'")quote=null;else word+=ch;continue;}
    if(quote==='"') {
      if(ch==='"'){quote=null;continue;}
      if(ch==='$'||ch==='`')return null;
      if(ch==='\\'&&'$`"\\'.includes(text[i+1]??'')&&i+1<text.length)word+=text[++i];else word+=ch;
      continue;
    }
    if(ch===' '||ch==='\t'){if(present){words.push(word);word='';present=false;}continue;}
    if(ch==="'"||ch==='"'){quote=ch;present=true;continue;}
    if(ch==='\\'){if(i+1===text.length)return null;word+=text[++i];present=true;continue;}
    if(';&|<>`$(){}~'.includes(ch)||(ch==='#'&&!present))return null;
    word+=ch;present=true;
  }
  if(quote)return null;
  if(present)words.push(word);
  return words.length&&words.length<=256&&!/^[\w]+=.*/.test(words[0])?words:null;
}

export function createCommandObservations({limit=10000}={}) {
  if(!Number.isSafeInteger(limit)||limit<1||limit>10000)throw Error('invalid-observation-limit');
  const seen=new Set();
  const state={schema_version:'continuity-command-observations/v2',completed_items:0,
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

export function qualifyNativeObservations() {
  const corpus=[['cat SPEC.md','reading'],["sed -n '1,20p' SPEC.md",'reading'],
    ['node ./templew.mjs context resolve . --compact','context_navigation'],['git status --short','git'],
    ['node --test test/*.test.mjs','testing'],['node ./templew.mjs work-item finish .','administration'],
    ['node ./templew.mjs doctor . --compact','diagnostics'],['cat SPEC.md; git status','unknown'],
    ['sed -i s/old/new/ quote.mjs','unknown']];
  const matched=corpus.filter(([body,category])=>classifyObservedCommand(`/bin/zsh -c '${body.replaceAll("'","'\\''")}'`)===category).length;
  return {schema_version:'continuity-observation-qualification/v1',status:matched===corpus.length?'passed':'failed',
    matched_cases:matched,total_cases:corpus.length,raw_data_retained:false,model_generation_performed:false,
    runtime_coverage:'not-measured',per_command_tokens:'not-observed'};
}
