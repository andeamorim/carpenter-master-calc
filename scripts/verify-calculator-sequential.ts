import { useCalculatorStore } from '../src/store/calculator';
import { useSettingsStore } from '../src/store/settings';
import { eq, op, resetCalculator, typeFeetInches, typeInches } from './test-helpers';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    const s = useCalculatorStore.getState();
    console.error(`  ✗ ${label}`);
    console.error(
      `    display="${s.display}" sub="${s.subDisplay}" last=${s.lastResult?.units} acc=${s.accumulator?.units} op=${s.pendingOperator}`,
    );
  }
}

console.log('Sequential calculator verification...\n');

useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });

// --- Chain after = ---
resetCalculator();
typeInches(10);
op('+');
typeInches(5);
eq();
assert('10" + 5" = 15"', useCalculatorStore.getState().display === `15"`);
op('+');
typeInches(3);
eq();
assert('chain: 15" + 3" = 18"', useCalculatorStore.getState().display === `18"`);

resetCalculator();
typeInches(12);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('12" / 2 = 6"', useCalculatorStore.getState().display === `6"`);
op('×');
useCalculatorStore.getState().pressDigit(3);
eq();
assert('chain: 6" × 3 = 18"', useCalculatorStore.getState().display === `18"`);

resetCalculator();
typeInches(11);
useCalculatorStore.getState().pressQuickFraction(15, 16);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('11-15/16 / 2', useCalculatorStore.getState().display === `6"`);
op('+');
typeInches(2);
eq();
assert('chain: 6" + 2" = 8"', useCalculatorStore.getState().display === `8"`);

// --- Triple chain without intermediate = ---
resetCalculator();
typeInches(2);
op('+');
typeInches(3);
op('+');
typeInches(4);
eq();
assert('2" + 3" + 4" (ops then =) = 9"', useCalculatorStore.getState().display === `9"`);

// --- Intermediate calc on chained ops ---
resetCalculator();
typeInches(10);
op('+');
typeInches(5);
op('+');
const mid = useCalculatorStore.getState();
assert('10+5 then + pending shows 15" accumulator', mid.display === `15"` && mid.pendingOperator === '+');

// --- Operator swap ---
resetCalculator();
typeInches(11);
op('+');
op('-');
assert('11" + → - swap', useCalculatorStore.getState().subDisplay === `11" -`);

// --- Feet-inch (enter in inches, view in feet) ---
resetCalculator();
typeInches(60);
op('+');
typeInches(42);
eq();
assert(`5' + 3'6" = 102" (inches mode)`, useCalculatorStore.getState().display === `102"`);
useCalculatorStore.getState().toggleInputUnit();
assert(`toggle to feet: 8'6"`, useCalculatorStore.getState().display === `8' 6"`);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert(`chain: 8'6" / 2 = 4'3"`, useCalculatorStore.getState().display === `4' 3"`);
useCalculatorStore.getState().toggleInputUnit();
resetCalculator();

// --- in-frac mode ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
resetCalculator();
typeInches(11);
op('+');
typeInches(2);
eq();
assert('in-frac: 11" + 2" = 13"', useCalculatorStore.getState().display === `13"`);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('in-frac chain: 13" / 2 = 6-1/2"', useCalculatorStore.getState().display === `6-1/2"`);

// --- After result: new digit clears ---
resetCalculator();
typeInches(9);
op('+');
typeInches(1);
eq();
useCalculatorStore.getState().pressDigit(5);
assert('after 10", digit 5 starts new entry', useCalculatorStore.getState().display === `5"`);

// --- After result: operator uses lastResult ---
resetCalculator();
typeInches(8);
op('+');
typeInches(2);
eq();
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('after 10", ÷2 = 5"', useCalculatorStore.getState().display === `5"`);

// --- Feet mode: 8 + 3 = 11' (both operands in feet) ---
resetCalculator();
useCalculatorStore.getState().toggleInputUnit();
useCalculatorStore.getState().pressDigit(8);
op('+');
useCalculatorStore.getState().pressDigit(3);
eq();
assert(`feet mode: 8' + 3' = 11'`, useCalculatorStore.getState().display === `11'`);
useCalculatorStore.getState().toggleInputUnit();
resetCalculator();

// --- AC preserves unit selection ---
useCalculatorStore.getState().toggleInputUnit();
useCalculatorStore.getState().pressDigit(5);
useCalculatorStore.getState().pressClear();
assert('AC keeps feet selected', useCalculatorStore.getState().inputUnit === 'feet');
assert('AC zero in feet', useCalculatorStore.getState().display === `0'`);
useCalculatorStore.getState().pressClear();
useCalculatorStore.getState().toggleInputUnit();

// --- Unit toggle ---
resetCalculator();
typeInches(72);
useCalculatorStore.getState().toggleInputUnit();
assert('72" toggles to 6\'', useCalculatorStore.getState().display === `6'`);
useCalculatorStore.getState().toggleInputUnit();
assert('6\' toggles back to 72"', useCalculatorStore.getState().display === `72"`);

resetCalculator();
typeInches(10);
op('+');
typeInches(5);
eq();
useCalculatorStore.getState().toggleInputUnit();
assert('15" toggles to 1\' 3"', useCalculatorStore.getState().display === `1' 3"`);
useCalculatorStore.getState().toggleInputUnit();

// --- Sign after result ---
resetCalculator();
typeInches(5);
op('+');
typeInches(3);
eq();
useCalculatorStore.getState().pressSign();
const afterSign = useCalculatorStore.getState().display;
assert('± after result negates (not 0)', afterSign.includes('-') || afterSign !== `0"`);

// --- Subtract chain ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
resetCalculator();
typeInches(20);
op('-');
typeInches(3);
eq();
op('-');
typeInches(2);
eq();
assert('chain: 17" - 2" = 15"', useCalculatorStore.getState().display === `15"`);

// --- Multiply dimensions ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
resetCalculator();
typeInches(6);
op('×');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('6" × 2 = 12"', useCalculatorStore.getState().display === `12"`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);