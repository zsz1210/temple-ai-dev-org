import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';
import {continuityRequests,continuityCompletion} from '../scripts/continuity-codex-adapter.mjs';
import {deliveryRequests,deliveryCompletion,deliveryProtocol,assessDeliveryCompletion} from '../scripts/continuity-delivery-contract.mjs';
import {observedBytes,classifyObservedCommand,createCommandObservations,requestByteObservation,unknownObservationReasons} from '../scripts/continuity-observations.mjs';
import {createSubjectLedger} from '../scripts/continuity-live-runner.mjs';
import {fixture,cli,git,deliveryArgs,itemState} from './helpers/lean-delivery-fixture.mjs';

const subject={root:'/fixture/actor',arm:'temple',itemId:'WI-0001',agentId:'agent-builder',model:'gpt-5.6-terra',effort:'medium'};
const completion=()=>({candidate_revision:'a'.repeat(40),test_command:'node --test test/*.test.mjs',test_exit_code:0,
  completed:'Implemented approved product behavior',blockers:[],next_owner:'quality_evaluator',
  not_performed:['Quality Evaluator acceptance, Independent QA and Release Gate']});

test('future completion separates blockers, owner and unperformed work without changing historical schema',()=>{
  const validate=new Ajv({strict:false}).compile(deliveryCompletion);
  const good=completion();assert.equal(validate(good),true);
  assert.deepEqual(assessDeliveryCompletion(good,{oraclePassed:true,arm:'temple'}),{
    schema_valid:true,product_passed:true,handoff_valid:true,build_accepted:true,accepted:true});
  for(const changed of [
    {...good,blockers:['Discount calculation is incorrect']}, {...good,test_exit_code:1},
    {...good,candidate_revision:null}, {...good,test_exit_code:null}, {...good,test_command:''},
    {...good,next_owner:null}, {...good,next_owner:'reviewer'}, {...good,blockers:['']}
  ]) assert.equal(assessDeliveryCompletion(changed,{oraclePassed:true,arm:'temple'}).accepted,false);
  // Prose claiming a defect is downstream cannot bypass the actual oracle.
  assert.equal(assessDeliveryCompletion({...good,not_performed:['Fix failing discount behavior']},{oraclePassed:false,arm:'temple'}).accepted,false);
  assert.equal(assessDeliveryCompletion({...good,next_owner:'reviewer'},{oraclePassed:true,arm:'ordinary'}).accepted,true);
  const legacy={candidate_revision:good.candidate_revision,test_command:good.test_command,test_exit_code:0,completed:good.completed,unresolved:['No product issues; Test is next.']};
  assert.equal(new Ajv().compile(continuityCompletion)(legacy),true);
  assert.equal(validate(legacy),false);assert.equal(legacy.unresolved.length,1);
  assert.equal(deliveryProtocol,'continuity-approved/v4');
});

test('both arms keep the same product task and reporting contract; only Temple administration differs',()=>{
  const legacy=continuityRequests(subject),a=deliveryRequests(subject),b=deliveryRequests({...subject,arm:'ordinary'});
  assert.equal(a.common_instructions,b.common_instructions);assert.deepEqual(a.turn.outputSchema,b.turn.outputSchema);
  assert.equal(a.common_instructions,legacy.common_instructions.replace('and unresolved issues','and actual blockers'));
  assert.match(a.governance_instructions,/compact context resolve first/);
  assert.match(a.governance_instructions,/work-item finish once/);
  assert.match(a.governance_instructions,/native instructions and bootstrap/);
  assert.match(a.governance_instructions,/context enter is optional/);
  assert.match(a.governance_instructions,/still report that tested product SHA/);
  assert.doesNotMatch(b.governance_instructions,/work-item finish/);
  assert.equal(a.thread.allowProviderModelFallback,false);assert.equal(a.live_ready,false);
  const bytes=requestByteObservation(a);
  assert.equal(bytes.authored_user_text.bytes,Buffer.byteLength(a.turn.input[0].text));
  assert.equal(bytes.total_model_context_bytes,null);assert.equal(bytes.native_context_bytes,null);
  assert.doesNotMatch(JSON.stringify(bytes),/SPEC.md|fixture|approved change/);
});

test('observations distinguish coarse commands and conservatively retain unknown attribution',()=>{
  for(const [command,category] of [
    ['cat AGENTS.md','reading'],['node ./templew.mjs context resolve . --compact','context_navigation'],
    ['node --test test/*.test.mjs','testing'],['npm run verify:fast','testing'],['git status --short','git'],
    ['node ./templew.mjs work-item finish .','administration'],['node ./templew.mjs doctor .','diagnostics'],
    ['node ./templew.mjs status .','diagnostics'],['apply_patch patch','editing'],
    ['cat SPEC.md; git status','unknown'],['sh -c cat','unknown'],['node -e arbitrary','unknown'],
    ['cat $(secret)','unknown'],['cat SPEC.md | head','unknown'],[null,'unknown']
  ])assert.equal(classifyObservedCommand(command),category,command);
  assert.deepEqual(observedBytes(undefined),{bytes:null,status:'unavailable'});
  assert.equal(observedBytes('中文').bytes,6);
  assert.equal(observedBytes('x'.repeat(2*1024*1024+1)).status,'capped-lower-bound');
});

test('native literal shell wrappers qualify all intended categories without executing commands',()=>{
  const corpus=[['cat SPEC.md','reading'],["sed -n '1,20p' SPEC.md",'reading'],
    ['node ./templew.mjs context resolve . --compact','context_navigation'],
    ['node --test test/*.test.mjs','testing'],['git status --short','git'],
    ['node ./templew.mjs work-item finish .','administration'],['node ./templew.mjs doctor . --compact','diagnostics']];
  const state=createCommandObservations();let index=0;
  for(const [body,expected] of corpus)for(const shell of ['/bin/zsh','/bin/bash','/bin/sh'])for(const flag of ['-c','-lc']) {
    // Standard shell single-quote escaping, including a quoted sed argument.
    const command=`${shell} ${flag} '${body.replaceAll("'", "'\\''")}'`;
    assert.equal(classifyObservedCommand(command),expected,command);
    state.accept({type:'commandExecution',id:String(index++),command,aggregatedOutput:'synthetic'});
  }
  assert.equal(state.state.completed_items,42);assert.equal(state.state.categories.unknown,0);
  for(const command of ['sed -i s/old/new/ quote.mjs',"sed 'e touch marker' SPEC.md",'rg --pre=script value SPEC.md',
    `/bin/zsh -c 'cat SPEC.md; git status'`,`/bin/zsh -lc 'cat $(secret)'`,
    `/bin/sh -c '/bin/sh -c "cat SPEC.md"'`,`/bin/sh -c 'cat SPEC.md' trailing`,
    '/bin/zsh -c "cat $SECRET"',"/bin/zsh -c 'cat SPEC.md",'/bin/zsh -c "cat SPEC.md\nls"'])
    assert.equal(classifyObservedCommand(command),'unknown',command);
  assert.equal(classifyObservedCommand('/bin/zsh -c "cat SPEC.md"'),'reading');
  assert.doesNotMatch(JSON.stringify(state.state),/SPEC|synthetic|zsh|secret/);
});

test('bounded output counters deduplicate events and never store raw data or missing-as-zero coverage',()=>{
  const observations=createCommandObservations({limit:2});
  const item={type:'commandExecution',id:'secret-id',command:'cat secret-path',aggregatedOutput:'PRIVATE 中文'};
  observations.accept(item);observations.accept(item);
  observations.accept({...item,id:'second',command:'sh unknown',aggregatedOutput:undefined});
  observations.accept({...item,id:'third'});observations.accept({...item,id:null});
  const s=observations.state;
  assert.equal(s.completed_items,2);assert.equal(s.categories.reading,1);assert.equal(s.categories.unknown,1);
  assert.equal(s.observed_output_bytes,Buffer.byteLength(item.aggregatedOutput));assert.equal(s.output_unavailable,1);
  assert.equal(s.output_bytes_by_category.reading,s.observed_output_bytes);
  assert.equal(s.duplicate_events,1);assert.equal(s.unidentified_events,1);assert.equal(s.limit_reached,true);
  assert.doesNotMatch(JSON.stringify(s),/PRIVATE|secret|中文/);
  assert.throws(()=>createCommandObservations({limit:10001}),/invalid-observation-limit/);
});

test('unknown reasons explain parser limits without reclassifying or retaining commands',()=>{
  const observer=createCommandObservations(),sentinel='PRIVATE_SENTINEL';
  const cases=[
    [undefined,'command-unavailable'],[null,'command-unavailable'],
    ['x'.repeat(16385),'command-over-limit'],['','non-literal-command'],
    [`cat ${sentinel}; git status`,'non-literal-command'],['cat $(secret)','non-literal-command'],
    ["/bin/sh -c 'cat file",'non-literal-command'],
    ['sh unknown','unsupported-shell-wrapper'],["/bin/sh -c 'cat file' extra",'unsupported-shell-wrapper'],
    [`/bin/zsh -c 'cat ${sentinel}; git status'`,'non-literal-shell-body'],
    ["/bin/sh -c 'cat $(secret)'",'non-literal-shell-body'],
    ['node -e arbitrary','unsupported-literal-command'],
    ["/bin/sh -c 'node -e arbitrary'",'unsupported-literal-command'],
    ['sed -i s/old/new/ file','unsupported-literal-command']
  ];
  const counts=Object.fromEntries(unknownObservationReasons.map(r=>[r,0]));
  for(const [index,[command,reason]]of cases.entries()) {
    assert.equal(classifyObservedCommand(command),'unknown');counts[reason]++;
    observer.accept({type:'commandExecution',id:String(index),command,aggregatedOutput:sentinel});
  }
  observer.accept({type:'commandExecution',id:'read',command:'cat file',aggregatedOutput:'ok'});
  assert.equal(observer.state.schema_version,'continuity-command-observations/v3');
  assert.deepEqual(observer.state.unknown_reasons,counts);
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),observer.state.categories.unknown);
  for(const reason of unknownObservationReasons)assert.equal(observer.state.output_bytes_by_unknown_reason[reason],counts[reason]*sentinel.length);
  assert.equal(Object.values(observer.state.output_bytes_by_unknown_reason).reduce((a,b)=>a+b,0),observer.state.output_bytes_by_category.unknown);
  assert.doesNotMatch(JSON.stringify(observer.state),/PRIVATE_SENTINEL|arbitrary|secret|git status/);
});

test('unknown reason counters preserve deduplication, missing output and capped byte bounds',()=>{
  const observer=createCommandObservations({limit:2});
  const a={type:'commandExecution',id:'one',command:'node -e opaque'};
  observer.accept(a);observer.accept({...a,aggregatedOutput:'duplicate'});
  observer.accept({...a,id:'two',aggregatedOutput:'x'.repeat(2*1024*1024+1)});
  observer.accept({...a,id:'over-limit'});observer.accept({...a,id:null});
  assert.equal(observer.state.categories.unknown,2);
  assert.equal(observer.state.unknown_reasons['unsupported-literal-command'],2);
  assert.equal(observer.state.output_bytes_by_unknown_reason['unsupported-literal-command'],2*1024*1024);
  assert.equal(observer.state.output_unavailable,1);assert.equal(observer.state.output_capped,1);
  assert.equal(observer.state.duplicate_events,1);assert.equal(observer.state.unidentified_events,1);
  assert.equal(observer.state.limit_reached,true);
  assert.deepEqual(Object.keys(observer.state.unknown_reasons),unknownObservationReasons);
  assert.deepEqual(Object.keys(observer.state.output_bytes_by_unknown_reason),unknownObservationReasons);
});

test('actual subject ledger exposes reason counts without changing acceptance or missing history',()=>{
  const ledger=createSubjectLedger({threadId:'t',turnId:'r',remainingTokens:1000,deadline:1000,now:()=>1});
  const item={type:'commandExecution',id:'one',command:"/bin/sh -c 'cat file; git status'",aggregatedOutput:'synthetic',exitCode:0};
  ledger.accept({method:'item/started',params:{threadId:'t',turnId:'r',item}});
  ledger.accept({method:'item/completed',params:{threadId:'t',turnId:'r',item}});
  assert.equal(ledger.state.first_stop,null);assert.equal(ledger.state.completed_commands,1);
  assert.equal(ledger.state.command_observations.unknown_reasons['non-literal-shell-body'],1);
  assert.equal(ledger.state.command_observations.output_bytes_by_unknown_reason['non-literal-shell-body'],9);
  assert.doesNotMatch(JSON.stringify(ledger.state),/cat file|synthetic/);
  // Old records are read as-is, not regenerated by feeding absent commands back.
  const old=JSON.parse('{"schema_version":"continuity-command-observations/v2","categories":{"unknown":12}}');
  assert.equal(Object.hasOwn(old,'unknown_reasons'),false);
});

test('installed small-task recipe completes directly after compact navigation with one handoff and full diagnostics',async t=>{
  const f=await fixture();t.after(f.cleanup);
  // Synthetic integration policy, not a production policy mutation.
  const integrationPath=path.join(f.target,'.ai-org/project/repository-integration.json');
  const integration=JSON.parse(await fs.readFile(integrationPath));
  await fs.writeFile(integrationPath,JSON.stringify({...integration,status:'confirmed',source:'human-confirmed',summary:'Local fixture only',
    change_isolation:'not-required',review_gate:'not-required',recorded_at:'2026-09-01T00:00:00.000Z',recorded_by:'human'}));
  const installed=await fs.readFile(path.join(f.target,'.agents/skills/temple-work/references/lean-execution.md'),'utf8');
  assert.match(installed,/finish.*does not require a packet/);
  // Exercise managed upgrade from an older checkpoint as well as fresh init.
  const reference='.agents/skills/temple-work/references/lean-execution.md';
  const old='Historical synthetic procedure\n';
  const {createHash}=await import('node:crypto');
  const lockPath=path.join(f.target,'temple.lock'),lock=JSON.parse(await fs.readFile(lockPath));
  lock.managed_files.find(e=>e.path===reference).sha256=createHash('sha256').update(old).digest('hex');
  await fs.writeFile(path.join(f.target,reference),old);await fs.writeFile(lockPath,JSON.stringify(lock));
  const projectOwned=await fs.readFile(integrationPath,'utf8');
  cli(['upgrade',f.target]);
  assert.equal(await fs.readFile(path.join(f.target,reference),'utf8'),installed);
  assert.equal(await fs.readFile(integrationPath,'utf8'),projectOwned);
  const route=cli(['context','resolve',f.target,'--work-item',f.item.id,'--position','developer','--compact','--no-write','--json']);
  assert.equal(JSON.parse(route.stdout).work_item.state,'build');
  const args=deliveryArgs(f);args[1]='finish';args.push('--position','developer');
  const result=JSON.parse(cli(args).stdout);
  assert.equal(result.success,true);assert.equal(result.diagnostics.doctor.validation_scope,'full');
  const work=await itemState(f);assert.equal(work.state,'test');assert.equal(work.handoffs.length,1);
  assert.equal(work.claim.status,'released');assert.deepEqual(work.unresolved,[]);
  assert.equal(work.handoffs[0].to_position,'quality_evaluator');
  assert.equal(work.developer_candidate_revision,git(f.target,['rev-parse','HEAD']));
  t.diagnostic(JSON.stringify({kind:'offline-structure-only',navigation_calls:1,completion_calls:1,
    extra_packet_calls:0,extra_status_doctor_calls:0,compact_output_bytes:route.output_bytes,
    model_generation_performed:false}));
});
