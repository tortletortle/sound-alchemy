const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(js);
const begin=js.indexOf('// AME_BEGIN');
const end=js.indexOf('// AME_END',begin)+'// AME_END'.length;
assert.ok(begin>=0&&end>begin,'AME source markers must exist');
const api=vm.runInNewContext(js.slice(begin,end)+'\n({createMusicState,musicFrame,MUSIC_SCALE})');
function simulate(hz,input,duration=90,seed=12345){
 const state=api.createMusicState(0,seed),events=[];
 for(let i=0;i<=hz*duration;i++){const r=api.musicFrame(state,input,i/hz);if(r.event)events.push(r.event)}
 return {bpm:state.bpm,events};
}
const calmInput={energy:.08,mid:.1,high:.04,hit:0,calm:true,theme:0};
const activeInput={energy:.85,mid:.7,high:.8,hit:.2,calm:false,theme:0};
const calm=simulate(60,calmInput),active=simulate(60,activeInput);
assert.ok(active.bpm>calm.bpm+10,'active ambience should raise tempo');
assert.ok(calm.bpm>=42&&calm.bpm<=80&&active.bpm>=42&&active.bpm<=80,'tempo must stay bounded');
for(const e of active.events){
 assert.equal(e.chordMidi.length,4);
 assert.ok(e.chordMidi.every(Number.isFinite));
 assert.equal(e.chordIndex,Math.floor(e.step/16)%4);
 if(e.noteMidi!==null){
  const pc=((e.noteMidi-e.rootMidi)%12+12)%12;
  assert.ok(api.MUSIC_SCALE.includes(pc),'melody note must belong to Dorian scale');
 }
}
const rates=[30,60,120].map(hz=>simulate(hz,{energy:.5,mid:.35,high:.2,hit:.1,calm:false,theme:1},60));
assert.ok(Math.max(...rates.map(x=>x.events.length))-Math.min(...rates.map(x=>x.events.length))<=1,'step count should be frame-rate independent');
const repeat=simulate(60,activeInput);
assert.equal(JSON.stringify(active.events.map(e=>[e.step,e.chordIndex,e.noteMidi])),JSON.stringify(repeat.events.map(e=>[e.step,e.chordIndex,e.noteMidi])),'same seed and input must be deterministic');
assert.ok([0,1,2,3].every(i=>active.events.some(e=>e.chordIndex===i)),'four-chord progression should cycle');
console.log(JSON.stringify({status:'PASS',calmBpm:+calm.bpm.toFixed(2),activeBpm:+active.bpm.toFixed(2),activeEvents:active.events.length,melodyNotes:active.events.filter(e=>e.noteMidi!==null).length,frameRateEvents:rates.map((x,i)=>({hz:[30,60,120][i],count:x.events.length,bpm:+x.bpm.toFixed(2)}))},null,2));
