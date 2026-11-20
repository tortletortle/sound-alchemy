const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(js);
const start=js.indexOf('function resetAcoustics()'),end=js.indexOf('let acoustics=resetAcoustics();',start);
if(start<0||end<0)throw Error('Missing acoustics implementation');
const api=vm.runInNewContext(js.slice(start,end)+'\n({resetAcoustics,acousticStep})');
function benchmark(reset,step){
  function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
  const rows=[];
  for(const hz of [30,60,120])for(const floor of [.004,.02,.08])for(const seed of [1,7,42,99,2026]){
    const next=rng(seed),s=reset();let tp=0,fp=0,missed=0,maxDelay=0;const events=[3.013,6.027,9.019,12.011],matched=new Set();
    for(let i=0;i<15*hz;i++){
      const t=i/hz,bg=floor*(1+.15*t/15)*(1+.16*(next()-.5)),idx=events.findIndex(e=>t>=e&&t<e+.12),rms=bg+(idx>=0?.025+floor*1.6:0);
      const p=step(s,rms,1/hz);
      if(p.fired){if(idx>=0&&!matched.has(idx)){matched.add(idx);tp++;maxDelay=Math.max(maxDelay,t-events[idx])}else fp++}
      if(!Number.isFinite(p.energy)||p.energy<0||p.energy>1)throw Error("energy out of range");
    }
    missed=events.length-matched.size;rows.push({hz,floor,seed,tp,fp,missed,maxDelay})
  }
  const totals=rows.reduce((a,r)=>({tp:a.tp+r.tp,fp:a.fp+r.fp,missed:a.missed+r.missed,maxDelay:Math.max(a.maxDelay,r.maxDelay)}),{tp:0,fp:0,missed:0,maxDelay:0});
  const s=reset();let plateau=0,after=0;for(let i=0;i<60*25;i++){const p=step(s,i<180?.006:.08,1/60);if(p.fired){plateau++;if(i>240)after++}}
  if(totals.fp||totals.missed||plateau!==1||after!==0)throw Error(JSON.stringify({totals,plateau,after}));
  return {cases:rows.length,...totals,plateau,after,finalFloor:s.floor};
}
console.log(JSON.stringify(benchmark(api.resetAcoustics,api.acousticStep),null,2));
