import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {Ledger,definitions,owned,requests,scopeCheck,join,write,git,sourceRoot} from "./experiment.mjs";
import {runStage,eventViolation} from "./actor.mjs";
import {classifyCommandItem} from "./command-policy.mjs";
import {inspectProvider} from "../../../scripts/delivery-control-pair.mjs";
import {seed,reference} from "./fixture.mjs";
test("seven stages, three disjoint module owners, original cap sum",()=>{
 assert.equal(definitions.length,7);assert.equal(definitions.reduce((n,d)=>n+d.tokens,0),600000);
 const paths=definitions.filter(d=>d.module).flatMap(d=>owned(d).filter(n=>n!=="DELIVERY.json"&&n!=="HANDOFF.md"));
 assert.equal(new Set(paths).size,6);assert.deepEqual(owned(definitions[1]),["VERIFICATION.json"]);
 assert.equal(requests("/assigned-repository",definitions[1]).turn.input[0].text,requests("/assigned-repository",definitions[6]).turn.input[0].text);
});
test("parallel cumulative accounting does not double count repeated counters",()=>{
 const l=new Ledger(600);l.update("a",{operational_tokens:100});l.update("b",{operational_tokens:150});l.update("a",{operational_tokens:120});
 assert.equal(l.total,270);l.update("a",{operational_tokens:120});assert.equal(l.total,270);
 assert.throws(()=>l.update("a",{operational_tokens:119}),/regressed/);
 assert.throws(()=>l.update("c",{operational_tokens:331}),/token-limit/);assert.equal(l.controller.signal.aborted,true);
});
test("immutable tests and cross-module changes rejected",()=>{
 assert.throws(()=>scopeCheck({"test/public.test.mjs":"a"},{"test/public.test.mjs":"b"},owned(definitions[2])),/scope/);
 assert.throws(()=>scopeCheck({"render.mjs":"a"},{"render.mjs":"b"},owned(definitions[2])),/scope/);
 assert.deepEqual(scopeCheck({"validate.mjs":"a"},{"validate.mjs":"b"},owned(definitions[2])),["validate.mjs"]);
});
test("literal command ownership and deny network/config controls",async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),"sales-policy-"));
 try{
 for(const [n,b]of Object.entries(seed("contract")))await write(root,n,b);
 const d=definitions[2],ctx={root,arm:"ordinary",stage:"build",writePaths:owned(d)};
 const classify=command=>classifyCommandItem({id:"x",type:"commandExecution",cwd:root,command,status:"inProgress",commandActions:[{type:"unknown",command}]},ctx);
 for(const c of ["node --test test/validate-added.test.mjs","node --test test/*.test.mjs","git add validate.mjs test/validate-added.test.mjs"])assert.equal(classify(c).allowed,true,c);
 for(const c of ["curl https://example.com","git add render.mjs","git add .","git config x y","node -e evil","cat ../secret","git status; git status"])assert.equal(classify(c).allowed,false,c);
 assert.equal(eventViolation({method:"item/started",params:{item:{type:"fileChange",changes:[{path:path.join(root,"render.mjs"),kind:{type:"update"}}]}}},ctx),"file-write-scope");
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test("safe join uses exact revisions and does not copy worker evidence over peers",async()=>{
 const lab=await fs.mkdtemp(path.join(os.tmpdir(),"sales-join-"));
 try{
 const files=seed("contract"),obs=[];
 for(const name of ["joined","validate","summarize","render"]){
 const root=path.join(lab,name);for(const [n,b]of Object.entries(files))await write(root,n,b);
 git(root,["init","-b","main"]);git(root,["add","."]);git(root,["commit","-qm","seed"]);
 if(name!=="joined"){await write(root,name+".mjs",reference[name+".mjs"]);git(root,["add",name+".mjs"]);git(root,["commit","-qm","module"]);const rev=git(root,["rev-parse","HEAD"]);await write(root,"HANDOFF.md",rev);obs.push({id:"worker_"+name,assessment:{record:{candidate_revision:rev}}});}
 }const result=await join(lab,obs);assert.equal(result.workers.length,3);
 for(const n of ["validate","summarize","render"])assert.equal(await fs.readFile(path.join(lab,"joined",n+".mjs"),"utf8"),reference[n+".mjs"]);
 await assert.rejects(join(lab,obs.slice(1)),/missing-worker/);
 }finally{await fs.rm(lab,{recursive:true,force:true});}
});
test("installed-wire synthetic completion, timeout, cap and external cancellation",async()=>{
 const contract=await inspectProvider({sourceRoot,model:"gpt-5.6-terra",effort:"medium"});
 const root=await fs.mkdtemp(path.join(os.tmpdir(),"sales-replay-"));
 try{
 const completion={candidate_revision:"a".repeat(40),test_command:"node --test test/*.test.mjs",test_exit_code:0,decision:"delivered",summary:"synthetic only",unresolved:[]};
 async function replay(mode){
 let closed=false,interrupted=false;const controller=new AbortController();
 const factory=(_p,_a,options)=>({notify(){},async close(){closed=true;},async request(method){
 if(method==="config/read")return {config:{memories:{use_memories:false,generate_memories:false},features:{memories:false}}};
 if(method==="thread/start")return {thread:{id:"thread"},model:"gpt-5.6-terra",reasoningEffort:"medium"};
 if(method==="turn/interrupt"){interrupted=true;options.onNotification({method:"turn/completed",params:{threadId:"thread",turn:{id:"turn",status:"interrupted"}}});return {};}
 if(method==="turn/start"){setTimeout(()=>{
 if(mode==="timeout")return;if(mode==="cancel"){controller.abort();return;}
 const values={inputTokens:100,cachedInputTokens:40,outputTokens:20,reasoningOutputTokens:5,totalTokens:120};
 options.onNotification({method:"thread/tokenUsage/updated",params:{threadId:"thread",turnId:"turn",tokenUsage:{total:values,last:values}}});
 options.onNotification({method:"item/completed",params:{threadId:"thread",turnId:"turn",completedAtMs:Date.now(),item:{id:"message",type:"agentMessage",text:JSON.stringify(completion),phase:"final_answer"}}});
 options.onNotification({method:"turn/completed",params:{threadId:"thread",turn:{id:"turn",status:"completed"}}});
 },1);return {turn:{id:"turn"}};}return {};}});
 const result=await runStage({root,stage:"build",protocol:{model:"gpt-5.6-terra",reasoning_effort:"medium",limits:{per_stage_ms:100,per_stage_operational_tokens:mode==="cap"?50:1000,aggregate_operational_tokens:600000}},contract,sourceRoot,providerFactory:factory,deadline:Date.now()+3000,diagnosticKey:Buffer.alloc(32),requests:requests(root,definitions[0]),writePaths:owned(definitions[0]),signal:controller.signal});
 assert.equal(closed,true);
 if(mode==="success"){assert.equal(result.status,"completed",JSON.stringify(result));assert.equal(result.usage.operational_tokens,80);}
 else {assert.equal(result.status,"stopped");assert.equal(interrupted,true);}
 }
 for(const mode of ["success","cap","timeout","cancel"])await replay(mode);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
