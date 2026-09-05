// Design checks only. No model execution or provider calls are implemented here.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export const protocol=JSON.parse(readFileSync(new URL('./protocol.json',import.meta.url)));
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:8*1024*1024});
export function operational(usage) {
  if(!usage || !['input','cached','output'].every(k=>Number.isSafeInteger(usage[k]) && usage[k]>=0) || usage.cached>usage.input) return null;
  const value=usage.input-usage.cached+usage.output;return Number.isSafeInteger(value)?value:null;
}
export function aggregate(actors,exclusiveCoverage) {
  if(!exclusiveCoverage || !actors.length || new Set(actors.map(x=>x.id)).size!==actors.length || actors.some(x=>!x.id || !x.settled || operational(x.usage)===null))return null;
  const value=actors.reduce((n,x)=>n+operational(x.usage),0);return Number.isSafeInteger(value)?value:null;
}
export function readiness(p) {
  const blockers=Object.entries(p.live_readiness).filter(([,v])=>v!==true).map(([k])=>k);
  if(!p.live_approval)blockers.push('live-budget-approval');
  return {ready:false,blockers:[...blockers,'executable-runner-not-implemented']};
}
export function sourceCheck() {
  const protectedPaths=['src','package.json','package-lock.json','scripts/delivery-control-pair.mjs','.ai-org/artifacts/WI-0189'];
  const protectedDiff=git('diff','--name-only',protocol.before,protocol.after,'--',...protectedPaths).toString().trim();
  const changed=git('diff','--name-only',protocol.before,protocol.after,'--','project-overlay').toString().trim().split('\n').filter(Boolean);
  const blobs=changed.map(p=>Object.fromEntries(['path', 'before','after'].map(k=>{
    if(k==='path')return [k,p];
    const found=git('ls-tree',protocol[k],'--',p).toString().trim();if(!found)return[k,null];
    const b=git('show',`${protocol[k]}:${p}`);return [k,{bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')}];
  })));
  return {protected_equal:!protectedDiff,protected_diff:protectedDiff,changed_instruction_files:blobs};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({kind:'generation-free-design-preflight',model_calls:0,source:sourceCheck(),live:readiness(protocol)},null,2));
