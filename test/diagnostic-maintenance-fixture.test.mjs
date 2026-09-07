import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { seedSource, referenceSource } from '../scripts/diagnostic-maintenance-fixture.mjs';
import { fixture, evaluateProduct, files, digest, subprocessEnvironment } from '../scripts/delivery-control-pair.mjs';
import { prepareSubject } from '../scripts/diagnostic-format-comparison.mjs';
const exec = promisify(execFile);
const temp = async t => { const root = await fs.mkdtemp(path.join(os.tmpdir(), 'diagnostic-fixture-')); t.after(() => fs.rm(root, { recursive: true, force: true })); return root; };
test('maintenance seed passes public behavior, fails the named oracle regression, minimal repair passes entire unchanged oracle', async t => {
  const root = await temp(t);
  for (const [name, body] of Object.entries(fixture)) { await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true }); await fs.writeFile(path.join(root, name), body); }
  await fs.writeFile(path.join(root, 'order.mjs'), seedSource);
  const env = subprocessEnvironment(); delete env.NODE_TEST_CONTEXT; delete env.NODE_OPTIONS;
  await exec(process.execPath, ['--test', 'test/public.test.mjs'], { cwd: root, env });
  const { quoteOrder: broken } = await import(pathToFileURL(path.join(root, 'order.mjs')).href);
  for (const key of ['shippingCents', 'freeShippingAtCents']) for (const value of [undefined, null]) assert.doesNotThrow(() => broken([{ unitCents: 1, quantity: 1 }], { [key]: value }));
  assert.equal((await evaluateProduct(root)).exit_code, 1);
  assert.equal(seedSource.replace('options[name] ?? fallback', 'Object.hasOwn(options, name) ? options[name] : fallback'), referenceSource);
  await fs.writeFile(path.join(root, 'order.mjs'), referenceSource);
  assert.equal((await evaluateProduct(root)).exit_code, 0);
  const { quoteOrder: repaired } = await import(pathToFileURL(path.join(root, 'order.mjs')).href + '?repaired');
  for (const key of ['shippingCents', 'freeShippingAtCents']) for (const value of [undefined, null]) assert.throws(() => repaired([{ unitCents: 1, quantity: 1 }], { [key]: value }), TypeError);
  assert.deepEqual(repaired([], undefined), { subtotalCents: 0, shippingCents: 0, totalCents: 0 });
  assert.deepEqual(repaired([{ unitCents: 0, quantity: 1 }], Object.create(null)), { subtotalCents: 0, shippingCents: 500, totalCents: 500 });
});
test('prepared maintenance actor has seed only, immutable common brief/public tests and no reference or oracle', async t => {
  const lab = await temp(t), { root, pair } = await prepareSubject(path.join(lab, 'subject'), 'maintenance');
  const snapshot = await files(root);
  assert.deepEqual(snapshot, pair.arms.temple.files);
  assert.equal(snapshot['order.mjs'], digest(seedSource));
  for (const [name, body] of Object.entries(fixture)) if (name !== 'order.mjs') assert.equal(snapshot[name], digest(body));
  for (const name of Object.keys(snapshot)) {
    assert.doesNotMatch(name, /(?:^|\/)(?:oracle\.mjs|reference\.mjs|diagnostic-maintenance-fixture\.mjs)$/);
    assert.notEqual(await fs.readFile(path.join(root, name), 'utf8'), referenceSource);
  }
  assert.equal((await evaluateProduct(root)).exit_code, 1);
});
