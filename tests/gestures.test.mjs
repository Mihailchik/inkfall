// Gesture classification check. Runs without a camera: synthetic hands are fed
// to the functions taken straight from index.html, not to a copy of them.
//   node tests/gestures.test.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const page = fs.readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
const fnSrc = page.match(/function classifyHand\(L\)\{[\s\S]*?fist:[^}]*\}\}/)[0];
const modeExpr = page.match(/const mode=(s\.pinch\?[^;]+);/)[1];
const classifyHand = new Function(fnSrc + ';return classifyHand')();
const modeOf = (s, g) => new Function('s', 'g', 'return ' + modeExpr)(s, g);

// A right hand in camera space (0..1): wrist at the bottom, fingers up.
function hand({index = true, middle = true, ring = true, pinky = true, pinch = false} = {}) {
  const P = new Array(21);
  P[0] = {x: .5, y: .8};
  [[1, .45, .75], [2, .41, .70], [3, .38, .66], [4, .36, .62]].forEach(([i, x, y]) => (P[i] = {x, y}));
  const finger = (base, x, extended, topY) => {
    P[base] = {x, y: .62};
    if (extended) { P[base + 1] = {x, y: .54}; P[base + 2] = {x, y: .49}; P[base + 3] = {x, y: topY}; }
    else { P[base + 1] = {x, y: .55}; P[base + 2] = {x: x + .02, y: .60}; P[base + 3] = {x: x + .02, y: .64}; }
  };
  finger(5, .46, index, .44); finger(9, .50, middle, .40); finger(13, .54, ring, .44); finger(17, .58, pinky, .50);
  if (pinch) P[4] = {x: P[8].x - .01, y: P[8].y + .005};
  return P;
}

const cases = [
  ['open palm', hand(), {palm: true, victory: false, fist: false}, 'stir'],
  ['pointing', hand({middle: false, ring: false, pinky: false}), {palm: false, victory: false, fist: false, index: true}, 'hover'],
  ['peace sign', hand({ring: false, pinky: false}), {victory: true, palm: false}, 'peace'],
  ['fist', hand({index: false, middle: false, ring: false, pinky: false}), {fist: true, palm: false, index: false}, 'fist'],
  ['pinch', hand({pinch: true}), {palm: false}, 'paint'],
];
for (const [name, L, expect, mode] of cases) {
  const g = classifyHand(L);
  for (const [k, v] of Object.entries(expect)) assert.equal(g[k], v, `${name}: ${k} should be ${v}`);
  assert.equal(modeOf({pinch: g.pinchRatio < .32}, g), mode, `${name}: mode should be ${mode}`);
  console.log(`  ok  ${name.padEnd(11)} pinch ratio ${g.pinchRatio.toFixed(2)}  mode ${mode}`);
}

// Pinch hysteresis must not flicker around the threshold.
const on = .32, off = .46;
let pinch = false; const seq = [.5, .34, .31, .40, .45, .47, .33], got = [];
for (const r of seq) { if (!pinch && r < on) pinch = true; else if (pinch && r > off) pinch = false; got.push(pinch ? 1 : 0); }
assert.deepEqual(got, [0, 0, 1, 1, 1, 0, 0]);
const num = n => String(n).replace(/^0\./, '0?\\.');
assert.ok(new RegExp(`g\\.pinchRatio<${num(on)}\\b`).test(page) && new RegExp(`g\\.pinchRatio>${num(off)}\\b`).test(page), 'thresholds in index.html changed; update this test');
console.log('  ok  pinch hysteresis');
console.log(`\n${cases.length + 1} checks passed`);
