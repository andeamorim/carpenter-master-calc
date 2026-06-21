import { useCalculatorStore } from '../src/store/calculator';
import { useSettingsStore } from '../src/store/settings';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
    const s = useCalculatorStore.getState();
    console.error(`    display="${s.display}" sub="${s.subDisplay}" acc=${s.accumulator?.units} op=${s.pendingOperator} last=${s.lastResult?.units}`);
  }
}

function reset() {
  useCalculatorStore.getState().pressClear();
}

function typeInches(n: number) {
  for (const d of String(n)) useCalculatorStore.getState().pressDigit(Number(d));
}

console.log('Verifying calculator store flows...\n');

useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });

// Bug 3: 11" + 2" = 13"
reset();
typeInches(11);
useCalculatorStore.getState().pressOperator('+');
typeInches(2);
useCalculatorStore.getState().pressEquals();
assert('11" + 2" = 13"', useCalculatorStore.getState().display === `13"`);

// Bug 1: chain calculation from result on screen
reset();
typeInches(11);
useCalculatorStore.getState().pressOperator('+');
typeInches(4);
useCalculatorStore.getState().pressEquals();
useCalculatorStore.getState().pressOperator('÷');
useCalculatorStore.getState().pressDigit(2);
useCalculatorStore.getState().pressEquals();
assert('15" / 2 chains from prior result', useCalculatorStore.getState().display === `7-1/2"`);

reset();
typeInches(11);
useCalculatorStore.getState().pressQuickFraction(15, 16);
useCalculatorStore.getState().pressOperator('÷');
useCalculatorStore.getState().pressDigit(2);
useCalculatorStore.getState().pressEquals();
useCalculatorStore.getState().pressOperator('÷');
useCalculatorStore.getState().pressDigit(2);
useCalculatorStore.getState().pressEquals();
assert(
  '11-15/16 / 2 / 2 chains twice (not 0"/2)',
  useCalculatorStore.getState().display === `3"` &&
    !useCalculatorStore.getState().subDisplay.startsWith(`0"`),
);

// Bug 2: 11" + then switch to -
reset();
typeInches(11);
useCalculatorStore.getState().pressOperator('+');
useCalculatorStore.getState().pressOperator('-');
const st = useCalculatorStore.getState();
assert(
  '11" + then - keeps 11" and swaps operator',
  st.display === `11"` && st.subDisplay === `11" -` && st.pendingOperator === '-',
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);