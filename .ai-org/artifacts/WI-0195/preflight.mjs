import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceCheck as predecessorSourceCheck } from '../WI-0193/preflight.mjs';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export const protocol=JSON.parse(fs.readFileSync(new URL('./protocol.json',import.meta.url),'utf8'));
export function sourceCheck(){
 const result=predecessorSourceCheck();
 if(protocol.before!=='4c6a23213516eaabc4b4e184ca60115e7ab3bc21'||protocol.after!=='f9332bdca3264eebfd071607c00d7c3415f77d24')throw Error('source-revision-drift');
 return result;
}
export function readiness(p=protocol){
 const blockers=Object.entries(p.live_readiness).filter(([,value])=>value!==true).map(([key])=>key);
 if(!p.live_approval)blockers.push('fresh-live-budget-approval');
 return {ready:blockers.length===0,blockers};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({kind:'generation-free-successor-preflight',model_calls:0,source:sourceCheck(),live:readiness()},null,2));

