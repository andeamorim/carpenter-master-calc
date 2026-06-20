import {
  add,
  formatDimensional,
  fromFeetInchesFraction,
  parseDimensionalInput,
  subtract,
} from '../src/engine/dimensional';
import { solveRightAngle } from '../src/engine/right-angle';
import { calculateStairs } from '../src/engine/stairs';

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

console.log('Verifying math engine...\n');

const twelveSixHalf = fromFeetInchesFraction(12, 6, 1, 2);
assert('format 12\' 6-1/2"', formatDimensional(twelveSixHalf, 16) === `12' 6-1/2"`);

const sum = add(fromFeetInchesFraction(12, 6, 0, 1), fromFeetInchesFraction(3, 4, 1, 2));
assert('12\'6" + 3\'4-1/2" = 15\'10-1/2"', formatDimensional(sum, 16) === `15' 10-1/2"`);

const diff = subtract(fromFeetInchesFraction(10, 0, 0, 1), fromFeetInchesFraction(2, 6, 0, 1));
assert('10\' - 2\'6" = 7\'6"', formatDimensional(diff, 16) === `7' 6"`);

const parsed = parseDimensionalInput(`12' 6-1/2"`);
assert('parse input', parsed !== null && formatDimensional(parsed, 16) === `12' 6-1/2"`);

const rafter = solveRightAngle({
  run: fromFeetInchesFraction(14, 4, 0, 1),
  pitchRatio: { rise: 7, run: 12 },
});
assert('rafter rise calculated', rafter !== null && rafter.rise.units > 0);

const stairs = calculateStairs({
  totalRise: fromFeetInchesFraction(9, 0, 0, 1),
  desiredRiserHeight: fromFeetInchesFraction(0, 7, 1, 2),
  desiredTreadWidth: fromFeetInchesFraction(0, 10, 0, 1),
  headroomRequired: fromFeetInchesFraction(6, 8, 0, 1),
  floorThickness: fromFeetInchesFraction(0, 10, 0, 1),
});
assert('stairs risers > 0', stairs.numberOfRisers > 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);