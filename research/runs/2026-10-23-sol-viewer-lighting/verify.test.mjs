import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvidence } from './verify.mjs';
test('incomplete or duplicate evidence fails closed',()=>{
 assert.throws(()=>validateEvidence({images:[]}),/72/);
 assert.throws(()=>validateEvidence({images:Array.from({length:72},()=>({id:'same'}))}),/identities/);
});
