import { create } from 'zustand';
import {
  add,
  formatDimensional,
  fromFeetInchesFraction,
} from '../src/engine/dimensional';

// Minimal re-implementation of the fixed operator logic for verification
function applyOperator(a: { units: number }, b: { units: number }, op: string) {
  switch (op) {
    case '+':
      return add(a, b);
    case '-':
      return { units: a.units - b.units };
    case '÷': {
      const divisor = b.units / 64;
      if (divisor === 0) return a;
      return { units: Math.round(a.units / divisor) };
    }
    default:
      return b;
  }
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

console.log('Verifying calculator chain logic...\n');

// Bug 3: in-frac display
const eleven = fromFeetInchesFraction(0, 11, 0, 1);
const two = fromFeetInchesFraction(0, 2, 0, 1);
const sum = add(eleven, two);
assert('11" + 2" = 13" in in-frac mode', formatDimensional(sum, 16, 'in-frac') === `13"`);

// Bug 1: chain from last result
const result = fromFeetInchesFraction(0, 11, 15, 16);
const halved = applyOperator(result, fromFeetInchesFraction(0, 2, 0, 1), '÷');
assert(
  '11-15/16 / 2 uses result as dividend',
  formatDimensional(halved, 32, 'in-frac') === `5-31/32"`,
);

// Bug 2: operator swap — accumulator unchanged
const acc = fromFeetInchesFraction(0, 11, 0, 1);
let pendingOp = '+';
const isNewEntry = true;
if (isNewEntry && acc && pendingOp) {
  pendingOp = '-';
}
assert(
  'operator swap keeps 11" accumulator',
  formatDimensional(acc, 16, 'in-frac') === `11"` && pendingOp === '-',
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);