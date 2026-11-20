const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(js);
const f = vm.runInNewContext('(' + js.match(/function advanceTravel\([^}]+\}/)[0] + ')');
function run(hz) {
  let phase = 0;
  for (let i = 0; i < hz * 120; i++) phase = f(phase, 1/hz, .4, false);
  return phase;
}
for (const hz of [30, 60, 120]) assert.ok(Math.abs(run(hz) - 105.6) < 1e-8);
assert.equal(f(100, 0, 1, true), 100);
assert.ok(Math.abs(f(100, .016, 1, true) - 100) < .021);
assert.ok(Math.abs(f(100, .016, 0, false) - 100 - .0096) < 1e-10);
console.log('JS parse PASS; 3 frame rates, zero-dt continuity, calm step, normal step PASS');
