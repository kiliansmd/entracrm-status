import test from 'node:test';
import assert from 'node:assert/strict';
import {probe,targets} from './probe.mjs';
const now=()=>new Date('2026-11-11T11:00:00Z');
test('only a successful, valid health response is reachable',async()=>{
  const result=await probe(targets[0],async()=>Response.json({status:'ok',private:'not published'}),now);
  assert.deepEqual(result,{id:'mdb',state:'reachable',checkedAt:now().toISOString()});
});
test('HTTP failures are published without their response details',async()=>{
  const result=await probe(targets[0],async()=>new Response('private server error',{status:503}),now);
  assert.equal(result.state,'unavailable');
  assert.ok(!JSON.stringify(result).includes('private'));
});
test('network failure or an unexpected payload stays unknown',async()=>{
  assert.equal((await probe(targets[0],async()=>{throw new Error('private network error');},now)).state,'unknown');
  assert.equal((await probe(targets[0],async()=>Response.json({status:'something else'}),now)).state,'unknown');
});
