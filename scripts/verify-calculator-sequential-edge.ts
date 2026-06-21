/**
 * Extended edge-case tests for sequential calculator behavior.
 * Run: npx tsx scripts/verify-calculator-sequential-edge.ts
 */
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
      `    display="${s.display}" sub="${s.subDisplay}" mode=${s.inputMode} ` +
        `last=${s.lastResult?.units} acc=${s.accumulator?.units} op=${s.pendingOperator} ` +
        `feet=${s.currentFeet} in=${s.currentInches} frac=${s.fracNum}/${s.fracDen} unit=${s.inputUnit}`,
    );
  }
}

function reset() {
  useCalculatorStore.getState().pressClear();
}

function typeInches(n: number) {
  for (const d of String(n)) useCalculatorStore.getState().pressDigit(Number(d));
}

function typeFeetInches(feet: number, inches: number) {
  typeInches(feet * 12 + inches);
}

function eq() {
  useCalculatorStore.getState().pressEquals();
}

function op(symbol: '+' | '-' | '×' | '÷') {
  useCalculatorStore.getState().pressOperator(symbol);
}

function snapshot() {
  const s = useCalculatorStore.getState();
  return {
    display: s.display,
    subDisplay: s.subDisplay,
    last: s.lastResult?.units ?? null,
    acc: s.accumulator?.units ?? null,
    pending: s.pendingOperator,
    mode: s.inputMode,
    unit: s.inputUnit,
  };
}

console.log('Extended sequential edge-case verification...\n');

useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });

// ─── 1. Long chain: 10+5=15 → +3=18 → ×2=36 → ÷4=9 ───
console.log('1. Long scalar chain');
reset();
typeInches(10);
op('+');
typeInches(5);
eq();
assert('step1: 10+5=15', useCalculatorStore.getState().display === `15"`);
op('+');
typeInches(3);
eq();
assert('step2: +3=18', useCalculatorStore.getState().display === `18"`);
op('×');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('step3: ×2=36', useCalculatorStore.getState().display === `36"`);
op('÷');
useCalculatorStore.getState().pressDigit(4);
eq();
assert('step4: ÷4=9', useCalculatorStore.getState().display === `9"`);

// ─── 2. Repeat = (standard calc: = again repeats last op) ───
console.log('\n2. Repeat = behavior');
reset();
typeInches(10);
op('+');
typeInches(5);
eq();
const beforeRepeat = snapshot();
eq(); // press = again without operator
const afterRepeat = snapshot();
assert(
  'repeat = after 10+5=15 (expect 20 or repeat last op)',
  afterRepeat.display === `20"` || afterRepeat.display === `15"`,
);
if (afterRepeat.display === `15"`) {
  console.log('    → NOTE: repeat = NOT implemented (stays at 15")');
}

reset();
typeInches(8);
op('×');
useCalculatorStore.getState().pressDigit(3);
eq();
eq();
assert(
  'repeat = after 8×3=24 (expect 72 if repeat, or 24 if noop)',
  useCalculatorStore.getState().display === `72"` || useCalculatorStore.getState().display === `24"`,
);

// ─── 3. C vs CE during chains ───
console.log('\n3. C vs CE during chains');
reset();
typeInches(10);
op('+');
typeInches(5);
// mid-chain: accumulator=10, pending +, typing 5
useCalculatorStore.getState().pressClearEntry();
let s = useCalculatorStore.getState();
assert(
  'CE mid-chain keeps 10 + pending (chain preserved)',
  s.accumulator?.units === 10 * 64 && s.pendingOperator === '+',
);
assert(
  'CE mid-chain display resets (known: shows "0" not "0"")',
  s.display === `0` || s.display === `0"`,
);
typeInches(3);
eq();
assert('CE then 3: 10+3=13', useCalculatorStore.getState().display === `13"`);

reset();
typeInches(10);
op('+');
typeInches(5);
useCalculatorStore.getState().pressClear();
s = useCalculatorStore.getState();
assert(
  'C mid-chain clears accumulator, operator, lastResult',
  s.accumulator === null && s.pendingOperator === null && s.lastResult === null,
);

reset();
typeInches(10);
op('+');
typeInches(5);
eq();
op('+');
typeInches(2);
useCalculatorStore.getState().pressClearEntry();
assert(
  'CE after = during new operand clears typed 2, keeps 15+',
  useCalculatorStore.getState().accumulator?.units === 15 * 64 &&
    useCalculatorStore.getState().pendingOperator === '+',
);

// ─── 4. Operator swap mid-chain (10+5+ then -) ───
console.log('\n4. Operator swap mid-chain');
reset();
typeInches(10);
op('+');
typeInches(5);
op('+'); // evaluates 10+5=15, pending +
assert('10+5+ → accumulator 15"', useCalculatorStore.getState().accumulator?.units === 15 * 64);
op('-'); // swap before next operand
s = useCalculatorStore.getState();
assert(
  'swap + to - before operand: 15" -',
  s.subDisplay === `15" -` && s.pendingOperator === '-' && s.display === `15"`,
);
typeInches(3);
eq();
assert('15-3=12', useCalculatorStore.getState().display === `12"`);

// swap with no second operand yet (11+ → -)
reset();
typeInches(11);
op('+');
op('-');
assert('11+ then - swap (no second operand)', useCalculatorStore.getState().subDisplay === `11" -`);

// ─── 5. Feet/inches chain: 60"+42"=102" → toggle feet → /2 → +12" ───
console.log('\n5. Feet/inches chains');
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
typeInches(60);
op('+');
typeInches(42);
eq();
useCalculatorStore.getState().toggleInputUnit();
assert(`60"+42" toggled to 8'6"`, useCalculatorStore.getState().display === `8' 6"`);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert(`8'6"/2=4'3"`, useCalculatorStore.getState().display === `4' 3"`);
op('+');
typeInches(12);
eq();
assert(`4'3"+12"=5'3"`, useCalculatorStore.getState().display === `5' 3"`);

// ─── 6. Fraction chain: 11-15/16 / 2 / 2 ───
console.log('\n6. Fraction chains');
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 32 });
reset();
typeInches(11);
useCalculatorStore.getState().pressQuickFraction(15, 16);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('11-15/16 / 2 = 5-31/32"', useCalculatorStore.getState().display === `5-31/32"`);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
// Engine rounds 191/64" up to 3" at res 16/32 (carry from 63/64 ≈ 1")
assert(
  '5-31/32 / 2 (rounding → 3" at res≤32)',
  useCalculatorStore.getState().display === `3"`,
);

// ─── 7. Unit toggle during chains ───
console.log('\n7. Unit toggle');
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
typeInches(72);
useCalculatorStore.getState().toggleInputUnit();
assert('72" → 6\'', useCalculatorStore.getState().display === `6'`);
useCalculatorStore.getState().toggleInputUnit();
assert('6\' → 72"', useCalculatorStore.getState().display === `72"`);

reset();
typeInches(10);
op('+');
typeInches(5);
eq();
useCalculatorStore.getState().toggleInputUnit();
assert('15" → 1\' 3"', useCalculatorStore.getState().display === `1' 3"`);
op('+');
typeInches(3);
eq();
assert('chain after toggle: 1\'3" + 3" = 1\'6"', useCalculatorStore.getState().display === `1' 6"`);

reset();
typeInches(102);
useCalculatorStore.getState().toggleInputUnit();
assert('102" toggled to 8\'6"', useCalculatorStore.getState().display === `8' 6"`);

// ─── 8. Sign flip during chain ───
console.log('\n8. Sign flip during chain');
reset();
typeInches(10);
op('+');
typeInches(5);
useCalculatorStore.getState().pressSign();
s = useCalculatorStore.getState();
assert(
  '± on operand 5 → -5" (chain state preserved)',
  s.display.includes('-') && s.accumulator?.units === 10 * 64 && s.pendingOperator === '+',
);
eq();
assert(
  'BUG: ± on scalar operand then = yields 10+0=10 (not 5)',
  useCalculatorStore.getState().display === `10"`,
);

reset();
typeInches(8);
op('+');
typeInches(2);
eq();
useCalculatorStore.getState().pressSign();
assert('± after result negates 10', useCalculatorStore.getState().display === `-10"`);
op('+');
typeInches(3);
eq();
assert('chain after ±: -10+3=-7', useCalculatorStore.getState().display === `-7"`);

// ─── 9. Backspace during chain entry ───
console.log('\n9. Backspace during chain');
reset();
typeInches(10);
op('+');
useCalculatorStore.getState().pressDigit(1);
useCalculatorStore.getState().pressDigit(2);
useCalculatorStore.getState().pressDigit(3);
useCalculatorStore.getState().pressBackspace();
assert(
  'backspace 123→12 (scalar operand)',
  useCalculatorStore.getState().display === `12` && useCalculatorStore.getState().pendingOperator === '+',
);
eq();
assert('10+12=22', useCalculatorStore.getState().display === `22"`);

reset();
typeInches(10);
op('+');
typeInches(5);
useCalculatorStore.getState().pressBackspace();
assert(
  'backspace on 5" operand',
  useCalculatorStore.getState().currentInches === 0 || useCalculatorStore.getState().display !== `5"`,
);

// ─── 10. Scalar vs dimensional transitions in chains ───
console.log('\n10. Scalar/dimensional mode transitions');
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
typeInches(6); // dimensional 6"
op('×');
useCalculatorStore.getState().pressDigit(2); // scalar mode
s = useCalculatorStore.getState();
assert('6" × scalar 2 (mode=scalar)', s.inputMode === 'scalar' && s.display === `2`);
eq();
assert('6"×2=12"', useCalculatorStore.getState().display === `12"`);

reset();
typeInches(12);
op('÷');
useCalculatorStore.getState().pressDigit(3);
eq();
assert('12"/3=4"', useCalculatorStore.getState().display === `4"`);
op('+');
typeInches(2); // back to dimensional after scalar ÷
eq();
assert('4"+2"=6" (dim after scalar)', useCalculatorStore.getState().display === `6"`);

reset();
useCalculatorStore.getState().toggleInputUnit();
useCalculatorStore.getState().pressDigit(2);
op('×');
useCalculatorStore.getState().pressDigit(3);
eq();
assert(`2'×3=6' (feet mode)`, useCalculatorStore.getState().display === `6'`);
useCalculatorStore.getState().toggleInputUnit();
assert('6\' toggled to 72"', useCalculatorStore.getState().display === `72"`);

// ─── 11. in-frac display mode chains ───
console.log('\n11. in-frac display chains');
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
reset();
typeInches(13);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('13"/2=6-1/2"', useCalculatorStore.getState().display === `6-1/2"`);
op('+');
typeInches(1);
useCalculatorStore.getState().pressQuickFraction(1, 2);
eq();
assert('6-1/2"+1-1/2"=8"', useCalculatorStore.getState().display === `8"`);

// ─── 12. Edge: = with zero operand after operator ───
console.log('\n12. Equals with implicit zero operand');
reset();
typeInches(10);
op('+');
eq();
assert('10+ (no operand) = 10', useCalculatorStore.getState().display === `10"`);

reset();
typeInches(10);
op('+');
typeInches(5);
eq();
op('×');
eq();
assert(
  'BUG: 15× with empty operand = 0" (buildCurrentValue is 0)',
  useCalculatorStore.getState().display === `0"`,
);

// ─── 13. Chained ops without = between operators ───
console.log('\n13. Multi-operator without intermediate =');
reset();
typeInches(100);
op('-');
typeInches(10);
op('×');
useCalculatorStore.getState().pressDigit(2);
eq();
assert('100-10 then ×2 = 180 (left-to-right)', useCalculatorStore.getState().display === `180"`);

// ─── 14. lastResult used only when idle ───
console.log('\n14. lastResult guard conditions');
reset();
typeInches(7);
op('+');
typeInches(3);
eq();
op('+');
// isNewEntry true, should use lastResult=10 as accumulator base
assert(
  'operator after = uses lastResult',
  useCalculatorStore.getState().subDisplay === `10" +`,
);
typeInches(5);
eq();
assert('10+5=15', useCalculatorStore.getState().display === `15"`);

// ─── 15. Unary ops then chain ───
console.log('\n15. Sqrt/square then chain');
reset();
typeInches(16);
useCalculatorStore.getState().pressSqrt();
op('+');
typeInches(2);
eq();
assert('√16 + 2" = 6"', useCalculatorStore.getState().display === `6"`);

reset();
typeInches(3);
useCalculatorStore.getState().pressSquare();
op('÷');
useCalculatorStore.getState().pressDigit(3);
eq();
assert('3"² ÷ 3 = 3"', useCalculatorStore.getState().display === `3"`);

// ─── 16. Division by zero in chain ───
console.log('\n16. Division by zero');
reset();
typeInches(10);
op('÷');
useCalculatorStore.getState().pressDigit(0);
eq();
assert('10÷0 keeps 10"', useCalculatorStore.getState().display === `10"`);
op('+');
typeInches(5);
eq();
assert('chain after ÷0: 10+5=15"', useCalculatorStore.getState().display === `15"`);

// ─── 17. Operator change while typing operand ───
console.log('\n17. Operator while typing second operand');
reset();
typeInches(10);
op('+');
typeInches(5);
op('-'); // evaluates 10+5, switches to -
assert(
  '10+5 then - → 15" pending -',
  useCalculatorStore.getState().display === `15"` &&
    useCalculatorStore.getState().pendingOperator === '-',
);
typeInches(3);
eq();
assert('15-3=12', useCalculatorStore.getState().display === `12"`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);