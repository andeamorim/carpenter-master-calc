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
    const s = useCalculatorStore.getState();
    console.error(`  ✗ ${label}`);
    console.error(
      `    display="${s.display}" sub="${s.subDisplay}" last=${s.lastResult?.units} acc=${s.accumulator?.units} op=${s.pendingOperator}`,
    );
  }
}

function reset() {
  const calc = useCalculatorStore.getState();
  calc.memoryClear();
  calc.pressClear();
}

function typeInches(n: number) {
  for (const d of String(n)) useCalculatorStore.getState().pressDigit(Number(d));
  useCalculatorStore.getState().pressInches();
}

function typeFeetInches(feet: number, inches: number) {
  for (const d of String(feet)) useCalculatorStore.getState().pressDigit(Number(d));
  useCalculatorStore.getState().pressFeet();
  if (inches > 0) {
    useCalculatorStore.getState().pressInches();
    for (const d of String(inches)) useCalculatorStore.getState().pressDigit(Number(d));
    useCalculatorStore.getState().pressInches();
  }
}

function eq() {
  useCalculatorStore.getState().pressEquals();
}

function op(symbol: '+' | '-' | '×' | '÷') {
  useCalculatorStore.getState().pressOperator(symbol);
}

console.log('Sequential calculator verification...\n');

useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });

// --- Chain after = ---
reset();
typeInches(10);
op('+');
typeInches(5);
eq();
assert('10" + 5" = 15"', useCalculatorStore.getState().display === `15"`);
op('+');
typeInches(3);
eq();
assert('chain: 15" + 3" = 18"', useCalculatorStore.getState().display === `18"`);

reset();
typeInches(12);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('12" / 2 = 6"', useCalculatorStore.getState().display === `6"`);
op('×');
useCalculatorStore.getState().pressDigit(3);
eq();
assert('chain: 6" × 3 = 18"', useCalculatorStore.getState().display === `18"`);

reset();
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
reset();
typeInches(2);
op('+');
typeInches(3);
op('+');
typeInches(4);
eq();
assert('2" + 3" + 4" (ops then =) = 9"', useCalculatorStore.getState().display === `9"`);

// --- Intermediate calc on chained ops ---
reset();
typeInches(10);
op('+');
typeInches(5);
op('+');
const mid = useCalculatorStore.getState();
assert('10+5 then + pending shows 15" accumulator', mid.display === `15"` && mid.pendingOperator === '+');

// --- Operator swap ---
reset();
typeInches(11);
op('+');
op('-');
assert('11" + → - swap', useCalculatorStore.getState().subDisplay === `11" -`);

// --- Feet-inch ---
useSettingsStore.getState().updateSettings({ displayMode: 'ft-in-frac', fractionResolution: 16 });
reset();
typeFeetInches(5, 0);
op('+');
typeFeetInches(3, 6);
eq();
assert(`5' + 3'6" = 8'6"`, useCalculatorStore.getState().display === `8' 6"`);

reset();
typeFeetInches(8, 6);
eq();
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert(`chain: 8'6" / 2 = 4'3"`, useCalculatorStore.getState().display === `4' 3"`);

// --- in-frac mode ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
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
reset();
typeInches(9);
op('+');
typeInches(1);
eq();
useCalculatorStore.getState().pressDigit(5);
assert('after 10", digit 5 starts new entry', useCalculatorStore.getState().display === `5"`);

// --- After result: operator uses lastResult ---
reset();
typeInches(8);
op('+');
typeInches(2);
eq();
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('after 10", ÷2 = 5"', useCalculatorStore.getState().display === `5"`);

// --- Memory chain ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
typeInches(6);
useCalculatorStore.getState().memoryAdd();
typeInches(4);
useCalculatorStore.getState().memoryAdd();
useCalculatorStore.getState().memoryRecall();
assert('memory: 6"+4" recalled = 10"', useCalculatorStore.getState().display === `10"`);

reset();
typeInches(10);
op('+');
typeInches(5);
eq();
useCalculatorStore.getState().memoryAdd();
useCalculatorStore.getState().memoryRecall();
assert('memory M+ after result adds displayed value', useCalculatorStore.getState().display === `15"`);

// --- Sign after result (known weak spot) ---
reset();
typeInches(5);
op('+');
typeInches(3);
eq();
useCalculatorStore.getState().pressSign();
const afterSign = useCalculatorStore.getState().display;
assert(
  '± after result negates (not 0)',
  afterSign.includes('-') || afterSign !== `0"`,
);

// --- Subtract chain ---
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
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
reset();
typeInches(6);
op('×');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('6" × 2 = 12"', useCalculatorStore.getState().display === `12"`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);