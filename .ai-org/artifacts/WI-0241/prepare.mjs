// Generation-free preparation. No model turn, consumed approval or live run.
import fs from 'node:fs/promises';
import path from 'node:path';
import {prepareContinuityRuntime,qualifyIsolatedOracle,prepareContinuityMatrix} from '../../../scripts/continuity-live-runner.mjs';
import {auditContinuityInputs} from '../../../scripts/continuity-fixture.mjs';

const prepared=await prepareContinuityRuntime({incremental:true});
console.log(JSON.stringify({phase:'runtime-prepared',lab:prepared.lab,model_generation_performed:false}));
await qualifyIsolatedOracle(prepared);
console.log(JSON.stringify({phase:'oracle-qualified',model_generation_performed:false}));
const frozen=await prepareContinuityMatrix(prepared);
const protocol=JSON.parse(await fs.readFile(path.join(prepared.lab,'protocol.json'),'utf8'));
const audits=[];
for(const s of protocol.subjects)audits.push({state:s.state,arm:s.arm,
  ...await auditContinuityInputs(s.root,s.itemId,s.agentId)});
const readiness={...frozen,version:protocol.version,model:protocol.envelope.model,effort:protocol.envelope.effort,
  proposed_envelope:protocol.envelope,live_authorized:false,live_run_started:false,
  interpretation:'Two missing compact measurements; historical controls remain separate. Preparation is not performance evidence.',audits};
await fs.writeFile(path.join(prepared.lab,'readiness.json'),JSON.stringify(readiness,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(readiness,null,2));
