// Checks the model engine embedded in index.html against the benchmarks it was calibrated and validated on.
// Run: node tests/engine.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
const m = html.match(/<script id="srp-engine">([\s\S]*?)<\/script>/);
if (!m) throw new Error('Engine script (id="srp-engine") not found in index.html');
const ctx = { module: { exports: {} } }; vm.createContext(ctx); vm.runInContext(m[1], ctx);
const E = ctx.module.exports;

const base = { weightLb: 170, bodyFat: 20, clothing: 'normal', scenario: 'A', swimAbility: 'avg', water: 'fresh',
  surfaceTempF: 72, restDepthFt: 180, restTempF: E.cToF(9), areaAcres: 12, runs: 4000, seed: 7 };
let failed = 0;
function check(name, value, lo, hi, unit = '') {
  const ok = value >= lo && value <= hi; if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${value.toFixed(3)}${unit} (expected ${lo}–${hi}${unit})`);
}
const refloat = (depth, tempC) => E.refloatProb(base, depth, E.cToF(tempC), 3000, 3);

const run = E.run(base);
check('Median entry-to-bottom, unconscious, 180 ft', E.pct(run.total, 50), 3.0, 4.5, ' min');
check('Median sink speed near surface', E.pct(run.vSurf, 50), 0.7, 1.2, ' ft/s');
const B = E.run({ ...base, scenario: 'B' });
check('Median entry-to-bottom, cannot swim, 180 ft', E.pct(B.total, 50), 4.5, 6.5, ' min');
// Calibration target: warm shallow water refloats in ~2-3 days
check('Median refloat, 5 ft, 24 °C', E.pct(refloat(5, 24).risers, 50), 2.0, 3.2, ' days');
// Temperature dependence
check('Median refloat, 5 ft, 10 °C', E.pct(refloat(5, 10).risers, 50), 10, 18, ' days');
// Depth limit: bodies below ~61 m (200 ft) generally do not bloat (Reijnen et al. 2018)
check('Refloat within 1 yr, 200 ft, 24 °C', refloat(200, 24).pYear, 0.15, 0.5);
check('Refloat within 1 yr, 180 ft, 9 °C', refloat(180, 9).pYear, 0, 0.12);
// Very cold water keeps bodies down (Lake Superior)
check('Refloat within 1 yr, 5 ft, 4 °C', refloat(5, 4).pYear, 0, 0.001);
// Reproducibility: same seed, same result
check('Same seed reproduces result exactly', Math.abs(E.run(base).pYear - run.pYear), 0, 0);

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
