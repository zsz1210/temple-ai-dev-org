// Coordinator-only bridge; public helper itself contains no oracle material.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isolatedOracleExecutor} from './continuity-live-runner.mjs';
import {write,tree} from './autonomy-experiment.mjs';
import {classifyMatrixCheck,gradeProduct} from './delivery-matrix-experiment.mjs';
import {deliveryCheckerSource} from './real-doc-check-fixture-v5.mjs';

export async function checkDeliveryFiles(files,fixture,base,lab,label,tests,{executor=isolatedOracleExecutor}={}){
  const root=path.join(lab,'checks',label+'-'+randomUUID());await fs.mkdir(root,{recursive:true});
  const material={...files,...fixture.publicTests,'check-delivery.mjs':deliveryCheckerSource,'package.json':JSON.stringify({type:'module'})};
  // Public feedback and reference/mutation regression checks cannot read hidden
  // oracle text and reflect it back through dynamic test names or stdout.
  if(tests.includes('oracle.test.mjs'))material['oracle.test.mjs']=fixture.hiddenTests;
  else delete material['oracle.test.mjs'];
  for(const [p,body]of Object.entries(material))await write(root,p,body);
  const executed=await executor(base,root,process.execPath,['check-delivery.mjs','--',...tests],{timeout:25000,maxBuffer:1024*1024});
  let report;try{report=JSON.parse(executed.stdout);}catch{throw Error('delivery-check-result-unreadable');}
  if(report.status!=='completed'||!report.owned_area_removed||executed.timed_out||!Number.isInteger(report.exit_code))throw Error('delivery-check-instrument-failure');
  const classified=classifyMatrixCheck({exit_code:report.exit_code,stdout:report.stdout,stderr:report.stderr,timed_out:report.timed_out});
  return {...classified,delivery:{accepted:report.accepted,temporary_residue:report.temporary_residue,workspace_changes:report.workspace_changes,owned_area_removed:report.owned_area_removed}};
}
export async function gradeDeliveryProduct(root,fixture,base,lab){
  const grade=await gradeProduct(root,fixture,base,lab,{check:checkDeliveryFiles});
  const files={};for(const p of Object.keys(await tree(root)).filter(p=>p.startsWith('src/')||p.startsWith('test/')))files[p]=await fs.readFile(path.join(root,p),'utf8');
  grade.public_delivery=await checkDeliveryFiles(files,fixture,base,lab,'public-delivery',Object.keys(files).filter(p=>p.startsWith('test/')&&p.endsWith('.test.mjs')));
  grade.delivery_version=1;
  grade.accepted=grade.accepted&&grade.behavior.delivery.accepted&&grade.regression?.delivery.accepted===true&&grade.public_delivery.delivery.accepted;
  return grade;
}
