import fs from 'node:fs/promises';
import path from 'node:path';

// Stage-local fixture gateway, not a change to installed Temple defaults.
export function recoveryReadOnlyArguments(input,root){
  const args=[...input];
  if(args.length===1&&['--version','--help'].includes(args[0]))return args;
  const command=args.shift(),action=['context','capability'].includes(command)?args.shift():null;
  const rules={doctor:[[],['--compact','--json']],status:[['--work-item'],['--compact','--json','--no-write']],observe:[[],['--json','--no-write']],capability:[['--query','--position','--limit'],['--json']],context:[['--work-item','--position','--stage','--purpose','--query','--revision','--limit','--agent-id','--principal-id','--material','--format','--expected-plan','--available-whole-sources'],['--json','--no-write','--compact']]};
  const rule=rules[command];
  if(!rule||(command==='context'&&!['resolve','packet','enter'].includes(action))||(command==='capability'&&!['list','find'].includes(action)))throw Error('recovery-read-only-command-denied');
  if(args[0]&&!args[0].startsWith('--')){if(path.resolve(root,args.shift())!==root)throw Error('recovery-read-only-target-denied');}
  for(let i=0;i<args.length;i++){
    if(rule[1].includes(args[i]))continue;
    if(!rule[0].includes(args[i])||i+1===args.length||args[i+1].startsWith('--'))throw Error('recovery-read-only-option-denied');
    i++;
  }
  if(['status','context','observe'].includes(command)&&!args.includes('--no-write'))args.push('--no-write');
  return [command,...(action?[action]:[]),'.',...args];
}

export async function installRecoveryReadOnly(root,pinnedCli){
  if(!path.isAbsolute(pinnedCli??''))throw Error('recovery-pinned-cli-required');
  const gateway=`import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';\n${recoveryReadOnlyArguments.toString()}\nconst root=path.dirname(fileURLToPath(import.meta.url));try{const args=recoveryReadOnlyArguments(process.argv.slice(2),root);const r=spawnSync(process.execPath,[${JSON.stringify(pinnedCli)},...args],{cwd:root,env:process.env,stdio:'inherit'});process.exitCode=r.status??1;}catch(e){process.stderr.write(e.message+'\\n');process.exitCode=2;}\n`;
  const file=path.join(root,'recovery-cli.mjs');await fs.writeFile(file,gateway,{flag:'wx'});return file;
}
