import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import Ajv from "ajv";
import {seed,modules,reference,oracle} from "./fixture.mjs";
import {runStage} from "./actor.mjs";
import {classifyCommandItem} from "./command-policy.mjs";
import {digest,inspectProvider,completionSchema,deliverySandboxPolicy,subprocessEnvironment,retainedArtifactDigest} from "../../../scripts/delivery-control-pair.mjs";
import {createJsonRpcProcess} from "../../../src/codex-app-server-provider.mjs";
import {wave5ThreadIsolation} from "../../../src/app-server-protocol-replay.mjs";
import {representativeAppServerArguments} from "../../../scripts/run-representative-microservice-comparison.mjs";
export const here=import.meta.dirname, sourceRoot=path.resolve(here,"../../..");
export const definitions=[
 {id:"single_builder",repo:"single",stage:"build",tokens:160000,ms:720000},
 {id:"single_verifier",repo:"single",stage:"verify",tokens:60000,ms:360000},
 ...modules.map(module=>({id:"worker_"+module,repo:module,stage:"build",module,tokens:80000,ms:360000})),
 {id:"parallel_integrator",repo:"joined",stage:"build",tokens:80000,ms:360000},
 {id:"parallel_verifier",repo:"joined",stage:"verify",tokens:60000,ms:360000}
];
export const owned=d=>d.stage==="verify"?["VERIFICATION.json"]:[...(d.module?[d.module]:modules).flatMap(n=>[n+".mjs","test/"+n+"-added.test.mjs"]),"DELIVERY.json","HANDOFF.md"];
const demand=(c,m)=>{if(!c)throw Error(m);};
export const read=async p=>JSON.parse(await fs.readFile(p,"utf8"));
export async function write(root,name,value){const p=path.join(root,name);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,typeof value==="string"?value:JSON.stringify(value,null,2)+"\n");}
export const git=(root,args)=>execFileSync("git",args,{cwd:root,env:subprocessEnvironment(),encoding:"utf8",timeout:30000,maxBuffer:1048576}).trim();
export async function snapshot(root){
 const files={};
 async function walk(rel=""){for(const e of await fs.readdir(path.join(root,rel),{withFileTypes:true})){
 if(e.name===".git")continue;const name=path.join(rel,e.name);demand(!e.isSymbolicLink(),"symlink");
 if(e.isDirectory())await walk(name);else {demand(e.isFile(),"not-regular-file");files[name]=digest(await fs.readFile(path.join(root,name)));}
 }}await walk();return files;
}
export function scopeCheck(before,after,paths){
 const changed=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(n=>before[n]!==after[n]);
 demand(changed.every(n=>paths.includes(n)),"write-scope");return changed;
}
export function requests(root,d){
 const testCommand=d.module?"node --test test/"+d.module+"-added.test.mjs":"node --test test/*.test.mjs";
 const job=d.stage==="verify"?
 "Fresh verifier, distinct from every Builder. Read DELIVERY.json and HANDOFF.md, inspect the exact candidate, run the complete tests and independently judge the whole contract. Do not repair or edit product/tests. Write VERIFICATION.json; decision accept or reject.":
 (d.module?"Implement ONLY the "+d.module+" module and its added tests. Other modules intentionally remain stubs: validate your module using focused tests, do not fix other files.":"Implement and validate all three modules. "+(d.repo==="joined"?"The coordinator has joined exact worker implementations. Read JOIN.md and inspect the combined candidate; repair integration defects within the same contract and scope.":""))+
 " Add meaningful tests. Commit implementation and added tests first, then record that exact full SHA in DELIVERY.json and HANDOFF.md. Evidence may remain uncommitted. decision delivered.";
 const text="Read README.md, WORK.md and BRIEF.md for the same complete product contract.\n"+job+
 "\nYour ONLY writable paths: "+owned(d).join(", ")+". Preserve every supplied non-owned file.\n"+
 "Run "+testCommand+" after the last code edit. Evidence and final JSON require candidate_revision, test_command (exactly "+testCommand+"), test_exit_code (actual), decision, summary, unresolved (array). Final JSON must agree with evidence. Verifier must use the handed-off revision. Stop after this stage; no later responsibility.";
 const developer="One bounded local actor turn. No subagents, network, installations, external tools, user questions, fallback, extra turns or other repositories/memories. Use apply_patch for file writes. One literal shell command per call: pwd/cat/ls/rg/sed/head/tail, node --test test/*.test.mjs or named test files, git status/diff/show/log/rev-parse/branch --show-current/ls-files, git add explicit owned paths, git commit -m. No pipes, redirects, substitutions, environment changes, arbitrary scripts, hooks/config changes or symlinks. Never git add . or -A. Within this initial turn edits and tests may iterate normally. Return the structured evidence when done.";
 return {thread:{model:"gpt-5.6-terra",cwd:root,approvalPolicy:"never",sandbox:"workspace-write",serviceName:"sales-poc",config:{model_reasoning_effort:"medium"},developerInstructions:developer,...wave5ThreadIsolation(root)},
 turn:{threadId:"schema-preview",input:[{type:"text",text}],cwd:root,approvalPolicy:"never",sandboxPolicy:deliverySandboxPolicy(root,d.stage),model:"gpt-5.6-terra",effort:"medium",outputSchema:completionSchema}};
}
export async function sandboxCommand(root,command){
 const c=createJsonRpcProcess("codex",representativeAppServerArguments,{cwd:root,env:subprocessEnvironment()});
 try{await c.request("initialize",{clientInfo:{name:"sales-poc-check",version:"1"},capabilities:{experimentalApi:false}});c.notify("initialized",{});
 return await c.request("command/exec",{command,cwd:root,sandboxPolicy:deliverySandboxPolicy(root,"checks"),timeoutMs:30000,outputBytesCap:131072},35000);
 }finally{await c.close();}
}
export async function testRoot(root,heldout=false){
 const names=heldout?["oracle.test.mjs"]:["test/public.test.mjs",...modules.map(n=>"test/"+n+"-added.test.mjs")];
 const r=await sandboxCommand(root,[process.execPath,"--test",...names]);
 return {exit_code:r.exitCode,output_sha256:digest((r.stdout??"")+(r.stderr??"")),output:(r.stdout??"")+(r.stderr??"")};
}
async function createRepo(root,files){await fs.mkdir(root,{recursive:true});for(const [n,b]of Object.entries(files))await write(root,n,b);git(root,["init","-b","main"]);git(root,["add","."]);git(root,["commit","-qm","Frozen sales-report seed"]);}
const boundFiles=["actor.mjs","command-policy.mjs","fixture.mjs","experiment.mjs","readiness.test.mjs","product-contract.md","approval.md","protocol.pending.json"];
export async function bindings(){
 const result={};
 for(const n of boundFiles)result[n]=digest(await fs.readFile(path.join(here,n)));
 for(const n of ["scripts/delivery-control-pair.mjs","src/codex-app-server-provider.mjs","src/app-server-protocol-replay.mjs","scripts/run-representative-microservice-comparison.mjs"])result[n]=digest(await fs.readFile(path.join(sourceRoot,n)));
 return result;
}
export async function prepare(lab){
 demand((await fs.readdir(lab)).length===0,"lab-not-empty");
 const contract=await fs.readFile(path.join(here,"product-contract.md"),"utf8"),files=seed(contract);
 for(const name of ["single",...modules,"joined"])await createRepo(path.join(lab,name),files);
 await createRepo(path.join(lab,"reference"),{...files,...reference,"oracle.test.mjs":oracle});
 const provider=await inspectProvider({sourceRoot,model:"gpt-5.6-terra",effort:"medium"});
 const ajv=new Ajv({strict:false,validateFormats:false});
 for(const d of definitions){const req=requests(path.join(lab,d.repo),d);demand(ajv.validate(provider.schemas.ThreadStartParams,req.thread),"thread-schema");demand(ajv.validate(provider.schemas.TurnStartParams,req.turn),"turn-schema");}
 const checks={seed:await testRoot(path.join(lab,"single")),reference_public:await testRoot(path.join(lab,"reference")),reference_hidden:await testRoot(path.join(lab,"reference"),true)};
 demand(checks.seed.exit_code!==0,"seed-must-fail");demand(checks.reference_public.exit_code===0&&checks.reference_hidden.exit_code===0,"reference-must-pass");
 // Negative controls: each contract module must be observable by the oracle.
 checks.mutants=[];
 for(const name of modules){await write(path.join(lab,"reference"),name+".mjs",files[name+".mjs"]);const r=await testRoot(path.join(lab,"reference"),true);demand(r.exit_code!==0,"mutant-survived");checks.mutants.push({module:name,...r});await write(path.join(lab,"reference"),name+".mjs",reference[name+".mjs"]);}
 const c=createJsonRpcProcess("codex",representativeAppServerArguments,{cwd:sourceRoot,env:subprocessEnvironment()});let account;
 try{await c.request("initialize",{clientInfo:{name:"sales-poc-account",version:"1"}});c.notify("initialized",{});account=await c.request("account/read",{refreshToken:false});demand(account?.account?.type==="chatgpt","subscription-required");
 await c.request("account/rateLimits/read",{});}finally{await c.close();}
 const negative=await sandboxCommand(path.join(lab,"single"),[process.execPath,"-e","require('fs').writeFileSync(process.argv[1],'denied')",path.join(lab,"forbidden-outside-actor")]);demand(negative.exitCode!==0,"sandbox-write-escape");
 const manifest={};
 for(const name of ["single",...modules,"joined"])manifest[name]={revision:git(path.join(lab,name),["rev-parse","HEAD"]),files:await snapshot(path.join(lab,name)),git_safety:await gitSafety(path.join(lab,name))};
 const protocol={schema_version:"temple.parallel-sales-poc/v1",work_item_id:"WI-0189",model:"gpt-5.6-terra",effort:"medium",source_revision:git(sourceRoot,["rev-parse","HEAD"]),bindings:await bindings(),definitions,fixture_sha256:digest(files),prompt_digests:definitions.map(d=>({id:d.id,sha256:digest(requests("/assigned-repository",d))})),manifest,provider_sha256:digest(provider),maximum_operational_tokens:600000,maximum_ms:2700000,concurrency:3,retries:0,fallback:false,reset:false,approval:"approval.md",cache:"uncontrolled",quality_rejection:"continue-independent-arm-within-envelope",fatal_error:"stop-all-no-resume"};
 await write(lab,"provider.json",provider);await write(lab,"protocol.json",protocol);await write(lab,"readiness.json",{model_generation_performed:false,checks,negative_write_exit_code:negative.exitCode,account_type:account.account.type,protocol_sha256:digest(protocol)});
 return {ready:true,protocol_sha256:digest(protocol),reference_pass:true,mutants_rejected:3,model_generation_performed:false};
}
export async function gitSafety(root){
 const result={};
 for(const n of ["config",...(await fs.readdir(path.join(root,".git/hooks"))).map(n=>"hooks/"+n)])result[n]=digest(await fs.readFile(path.join(root,".git",n)));
 return digest(result);
}
export class Ledger{
 constructor(limit=600000){this.limit=limit;this.values=new Map();this.controller=new AbortController();}
 update(id,usage){const previous=this.values.get(id);demand(!previous||usage.operational_tokens>=previous.operational_tokens,"usage-regressed");this.values.set(id,usage);if(this.total>this.limit){this.controller.abort();throw Error("operational-token-limit");}}
 get total(){return [...this.values.values()].reduce((n,u)=>n+u.operational_tokens,0);}
}
export async function assess(root,d,before,observation){
 const after=await snapshot(root);const changed=scopeCheck(before,after,owned(d));
 const record=await read(path.join(root,d.stage==="verify"?"VERIFICATION.json":"DELIVERY.json"));
 const valid=new Ajv().compile(completionSchema);demand(valid(record),"delivery-record-schema");
 for(const k of ["candidate_revision","test_command","test_exit_code","decision","unresolved"])demand(digest(record[k])===digest(observation.completion[k]),"completion-file-disagreement");
 demand(/^[a-f0-9]{40}$/.test(record.candidate_revision),"candidate-revision");
 const rev=git(root,["rev-parse",record.candidate_revision+"^{commit}"]);demand(rev===record.candidate_revision,"candidate-revision");
 for(const n of modules.flatMap(n=>[n+".mjs","test/"+n+"-added.test.mjs"]))demand(digest(execFileSync("git",["show",rev+":"+n],{cwd:root,env:subprocessEnvironment()}))===after[n],"candidate-content");
 const expected=d.module?"node --test test/"+d.module+"-added.test.mjs":"node --test test/*.test.mjs";
 demand(record.test_command===expected,"test-command-claim");
 const tests=observation.events.filter(e=>e.method==="item/completed"&&e.classification?.operation?.startsWith("product-tests"));
 demand(tests.length>0&&tests.at(-1).exit_code===record.test_exit_code,"actor-test-execution-unobserved");
 if(d.stage==="build")demand((await fs.readFile(path.join(root,"HANDOFF.md"),"utf8")).includes(rev),"handoff-evidence");
 else demand((await read(path.join(root,"DELIVERY.json"))).candidate_revision===rev,"verifier-revision");
 return {changed,record};
}
export async function join(lab,observations){
 const root=path.join(lab,"joined"),start=Date.now(),joined=[];
 for(const d of definitions.filter(d=>d.module)){
 const result=observations.find(o=>o.id===d.id);demand(result?.assessment,"missing-worker-candidate");
 const worker=path.join(lab,d.repo),revision=result.assessment.record.candidate_revision;
 for(const name of [d.module+".mjs","test/"+d.module+"-added.test.mjs"])await write(root,name,execFileSync("git",["show",revision+":"+name],{cwd:worker,env:subprocessEnvironment(),encoding:"utf8"}));
 joined.push({module:d.module,revision,handoff:await fs.readFile(path.join(worker,"HANDOFF.md"),"utf8")});
 }await write(root,"JOIN.md","# Exact worker join\n\n"+joined.map(j=>j.module+" @ "+j.revision+"\n"+j.handoff).join("\n\n"));
 git(root,["add",...modules.flatMap(n=>[n+".mjs","test/"+n+"-added.test.mjs"]),"JOIN.md"]);git(root,["commit","-qm","Join exact disjoint worker candidates"]);
 return {elapsed_ms:Date.now()-start,revision:git(root,["rev-parse","HEAD"]),workers:joined.map(({module,revision})=>({module,revision})),conflicts:0};
}
export async function run(lab){
 const protocol=await read(path.join(lab,"protocol.json")),provider=await read(path.join(lab,"provider.json"));
 demand(digest(protocol)===(await read(path.join(lab,"readiness.json"))).protocol_sha256,"protocol-readiness-drift");
 demand(digest(provider)===protocol.provider_sha256,"provider-contract-drift");
 demand(digest(protocol.definitions)===digest(definitions)&&protocol.retries===0&&protocol.fallback===false&&protocol.reset===false,"stage-envelope-drift");
 demand(digest(protocol.bindings)===digest(await bindings()),"source-drift");demand(protocol.maximum_operational_tokens===600000&&protocol.maximum_ms===2700000,"envelope-drift");
 demand(digest(await inspectProvider({sourceRoot,model:protocol.model,effort:protocol.effort}))===protocol.provider_sha256,"installed-provider-drift");
 for(const [name,m] of Object.entries(protocol.manifest)){demand(digest(await snapshot(path.join(lab,name)))===digest(m.files),"initial-state-drift");demand(await gitSafety(path.join(lab,name))===m.git_safety,"git-safety-drift");}
 await fs.writeFile(path.join(lab,"run-once.json"),JSON.stringify({protocol_sha256:digest(protocol),started_at:new Date().toISOString()}),{flag:"wx"});
 const start=Date.now(),deadline=start+protocol.maximum_ms,ledger=new Ledger(),observations=[],arms={},key=crypto.randomBytes(32);
 const timer=setTimeout(()=>ledger.controller.abort(),protocol.maximum_ms);
 const output={protocol_sha256:digest(protocol),execution_source_revision:git(sourceRoot,["rev-parse","HEAD"]),status:"running",observations,arms,parent_inference_tokens:"unattributed",cache:"uncontrolled",retry_count:0,fallback_count:0};
 async function checkpoint(){output.operational_tokens_last_observed=ledger.total;output.elapsed_ms=Date.now()-start;await write(lab,"result.json",output);}
 async function actor(d){
 demand(!ledger.controller.signal.aborted,"matrix-stopped");demand(digest(await bindings())===digest(protocol.bindings),"source-drift");
 const root=path.join(lab,d.repo),before=await snapshot(root),safety=await gitSafety(root),started=Date.now();
 console.log(JSON.stringify({event:"start",id:d.id}));
 const result=await runStage({root,stage:d.stage,protocol:{model:protocol.model,reasoning_effort:protocol.effort,limits:{per_stage_ms:d.ms,per_stage_operational_tokens:d.tokens,aggregate_operational_tokens:600000}},contract:provider,sourceRoot,deadline,diagnosticKey:key,requests:requests(root,d),writePaths:owned(d),onUsage:u=>ledger.update(d.id,u),signal:ledger.controller.signal});
 const o={id:d.id,started_at_ms:started-start,ended_at_ms:Date.now()-start,...result};observations.push(o);
 try{demand(o.status==="completed",o.stop_reason||"stage-stopped");demand(await gitSafety(root)===safety,"git-safety-drift");o.assessment=await assess(root,d,before,o);demand(digest(await bindings())===digest(protocol.bindings),"source-drift");}
 catch(e){o.status="stopped";o.stop_reason=e.message;ledger.controller.abort();await checkpoint();throw e;}
 await checkpoint();console.log(JSON.stringify({event:"complete",id:d.id,tokens:o.usage?.operational_tokens,ms:o.total_elapsed_ms}));return o;
 }
 async function objective(repo){
 const dest=path.join(lab,repo+"-oracle");await fs.mkdir(dest);
 for(const n of ["report.mjs",...modules.map(n=>n+".mjs")])await write(dest,n,await fs.readFile(path.join(lab,repo,n),"utf8"));
 await write(dest,"oracle.test.mjs",oracle);const r=await testRoot(dest,true);return {exit_code:r.exit_code,output_sha256:r.output_sha256};
 }
 try{
 const a=Date.now();await actor(definitions[0]);await actor(definitions[1]);arms.single={elapsed_ms:Date.now()-a,oracle:await objective("single")};
 const b=Date.now();const wave=await Promise.allSettled(definitions.filter(d=>d.module).map(actor));demand(wave.every(r=>r.status==="fulfilled"),"parallel-wave-stopped");
 output.join=await join(lab,observations);await actor(definitions[5]);await actor(definitions[6]);arms.parallel={elapsed_ms:Date.now()-b,oracle:await objective("joined")};
 const workers=observations.filter(o=>o.id.startsWith("worker_"));output.three_worker_overlap_ms=Math.max(0,Math.min(...workers.map(o=>o.ended_at_ms))-Math.max(...workers.map(o=>o.started_at_ms)));
 output.status="completed";
 }catch(e){output.status="stopped";output.stop_reason=e.message;ledger.controller.abort();}
 finally{clearTimeout(timer);await checkpoint();await write(lab,"seal.json",{result_sha256:digest(await fs.readFile(path.join(lab,"result.json"))),protocol_sha256:digest(protocol),sealed_at:new Date().toISOString()});}
 console.log(JSON.stringify({event:"matrix-terminal",status:output.status,tokens:ledger.total,elapsed_ms:output.elapsed_ms}));return output;
}
if(process.argv[1]===path.join(here,"experiment.mjs")){
 const [mode,lab]=process.argv.slice(2);demand(path.isAbsolute(lab??""),"absolute-lab-required");
 if(mode==="prepare")console.log(JSON.stringify(await prepare(lab)));
 else if(mode==="run")await run(lab);else throw Error("mode");
}
