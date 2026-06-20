import {
  divide,
  formatDimensional,
  fromDecimalInches,
  fromFeetInchesFraction,
} from '../src/engine/dimensional';

function hasCompleteFraction(fracNum: number, fracDen: number) {
  return fracNum > 0 && fracDen > 1;
}

function buildValue(feet: number, inches: number, fracNum: number, fracDen: number) {
  const active = hasCompleteFraction(fracNum, fracDen);
  return fromFeetInchesFraction(
    feet,
    inches,
    active ? fracNum : 0,
    active ? fracDen : 1,
  );
}

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

console.log('Verifying fraction input logic...\n');

const partial = buildValue(0, 11, 1, 0);
assert('partial numerator does NOT become 1 foot', formatDimensional(partial, 32) === `11"`);

const partial15 = buildValue(0, 11, 15, 0);
assert('partial 15 numerator stays 11"', formatDimensional(partial15, 32) === `11"`);

const complete = buildValue(0, 11, 15, 16);
assert('complete 11-15/16"', formatDimensional(complete, 32) === `11-15/16"`);

const halved = divide(complete, 2);
assert('11-15/16 / 2 = 5-31/32"', formatDimensional(halved, 32) === `5-31/32"`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);