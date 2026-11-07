import test from 'node:test';
import assert from 'node:assert/strict';
import {helix, makeTargets} from '../components/life/geometry.ts';

test('complementary strands retain their paired geometry',()=>{
  for(let i=0;i<=100;i++) {const a=helix(i/100,0),b=helix(i/100,1);assert.ok(Math.abs(a[0]+b[0])<1e-10);assert.equal(a[1],b[1]);assert.ok(Math.abs(a[2]+b[2])<1e-10);assert.ok(Math.abs(Math.hypot(a[0]-b[0],a[2]-b[2])-2.12)<1e-10);}
});
test('mobile and desktop particle targets are finite and bounded',()=>{
  for(const count of [1100,2400]) {const t=makeTargets(count);for(const key of ['dna','neural','cake','bursts']) {assert.equal(t[key].length,count*3);assert.ok(t[key].every(v=>Number.isFinite(v)&&Math.abs(v)<6));}assert.deepEqual(t.dna,makeTargets(count).dna);}
});
test('the neural field has no isolated neurons and is connected',()=>{
  const t=makeTargets(1100),seen=new Set([0]);let changed=true;
  while(changed) {changed=false;for(const [a,b] of t.edges) {assert.ok(a!==b);if(seen.has(a)&&!seen.has(b)){seen.add(b);changed=true;}if(seen.has(b)&&!seen.has(a)){seen.add(a);changed=true;}}}assert.equal(seen.size,t.nodes.length);
});
