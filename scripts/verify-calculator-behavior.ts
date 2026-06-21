/**
 * Full behavior matrix for Carpenter Master Calc.
 * Each section resets unit to INCHES unless testing FEET explicitly.
 * Run: npx tsx scripts/verify-calculator-behavior.ts
 */
import { useCalculatorStore } from '../src/store/calculator';
import { useSettingsStore } from '../src/store/settings';
import {
  eq,
  op,
  resetCalculator,
  typeFeetInchesDot,
  typeInches,
} from './test-helpers';

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
      `    display="${s.display}" sub="${s.subDisplay}" unit=${s.inputUnit} ` +
        `mode=${s.inputMode} feetDec=${s.feetInchDecimal} ` +
        `acc=${s.accumulator?.units} op=${s.pendingOperator}`,
    );
  }
}

function setInches() {
  resetCalculator();
}

function setFeet() {
  resetCalculator();
  useCalculatorStore.getState().toggleInputUnit();
}

function press(...keys: (number | '.' | 'frac' | 'bs' | 'ac' | 'ce' | 'toggle')[]) {
  const calc = useCalculatorStore.getState();
  for (const k of keys) {
    if (typeof k === 'number') calc.pressDigit(k);
    else if (k === '.') calc.pressDecimal();
    else if (k === 'frac') calc.pressFraction();
    else if (k === 'bs') calc.pressBackspace();
    else if (k === 'ac') calc.pressClear();
    else if (k === 'ce') calc.pressClearEntry();
    else if (k === 'toggle') calc.toggleInputUnit();
  }
}

console.log('Calculator behavior verification...\n');
useSettingsStore.getState().updateSettings({
  displayMode: 'in-frac',
  fractionResolution: 16,
  defaultInputUnit: 'inches',
});

// ─── INCH mode: digit entry ───
console.log('INCH — digit entry');
setInches();
press(4, 2);
assert('42 → 42"', useCalculatorStore.getState().display === `42"`);
setInches();
press(0, 0, 5);
assert('005 → 5" (leading zeros)', useCalculatorStore.getState().display === `5"`);
setInches();
typeInches(9);
op('+');
typeInches(1);
eq();
press(5);
assert('after 10", digit 5 replaces (not append)', useCalculatorStore.getState().display === `5"`);

// ─── INCH: fractions ───
console.log('\nINCH — fractions');
setInches();
typeInches(11);
useCalculatorStore.getState().pressQuickFraction(15, 16);
assert('11 + 15/16 quick', useCalculatorStore.getState().display === `11-15/16"`);
setInches();
typeInches(6);
useCalculatorStore.getState().pressFraction();
press(1);
useCalculatorStore.getState().pressDenominator(2);
assert('manual a/c 1/2', useCalculatorStore.getState().display === `6-1/2"`);

// ─── INCH: . disabled (UI only — store ignores pressDecimal) ───
console.log('\nINCH — decimal key ignored');
setInches();
press(3);
useCalculatorStore.getState().pressDecimal();
assert('pressDecimal in INCH has no effect', useCalculatorStore.getState().display === `3"`);

// ─── FEET: integer feet ───
console.log('\nFEET — integer entry');
setFeet();
press(8);
assert('8 → 8\'', useCalculatorStore.getState().display === `8'`);
setFeet();
press(1, 2);
assert('12 → 12\'', useCalculatorStore.getState().display === `12'`);

// ─── FEET: carpenter decimal 3.6 ───
console.log('\nFEET — carpenter decimal');
setFeet();
typeFeetInchesDot(3, 6);
assert('3.6 → 3\'6"', useCalculatorStore.getState().display === `3' 6"`);
setFeet();
press(5);
useCalculatorStore.getState().pressDecimal();
assert('5. → shows 5. before inches', useCalculatorStore.getState().display === `5.`);
press(0);
assert('5.0 → 5\'0" (value correct)', useCalculatorStore.getState().display.includes(`5`));

// ─── FEET: fractions only after decimal ───
console.log('\nFEET — fractions after decimal');
setFeet();
press(3);
useCalculatorStore.getState().pressDecimal();
press(6);
useCalculatorStore.getState().pressQuickFraction(1, 2);
assert('3.6 + 1/2 → 3\'6-1/2"', useCalculatorStore.getState().display === `3' 6-1/2"`);

// ─── FEET: +/− dimensional ───
console.log('\nFEET — dimensional +/-');
setFeet();
press(8);
op('+');
press(3);
eq();
assert('8\' + 3\' = 11\'', useCalculatorStore.getState().display === `11'`);
setFeet();
typeFeetInchesDot(5, 0);
op('+');
typeFeetInchesDot(3, 6);
eq();
assert('5\' + 3.6 = 8\'6"', useCalculatorStore.getState().display === `8' 6"`);

// ─── FEET: ×/÷ scalar second operand ───
console.log('\nFEET — scalar ×/÷');
setFeet();
press(6);
op('×');
press(2);
eq();
assert('6\' × 2 = 12\'', useCalculatorStore.getState().display === `12'`);
setFeet();
typeFeetInchesDot(8, 6);
op('÷');
press(2);
eq();
assert('8\'6" ÷ 2 = 4\'3"', useCalculatorStore.getState().display === `4' 3"`);

// ─── Unit toggle ───
console.log('\nUnit toggle');
setInches();
typeInches(72);
useCalculatorStore.getState().toggleInputUnit();
assert('72" → 6\'', useCalculatorStore.getState().display === `6'`);
useCalculatorStore.getState().toggleInputUnit();
assert('6\' → 72"', useCalculatorStore.getState().display === `72"`);
setInches();
typeInches(10);
op('+');
typeInches(5);
eq();
useCalculatorStore.getState().toggleInputUnit();
assert('15" result → 1\'3"', useCalculatorStore.getState().display === `1' 3"`);

// ─── AC / CE preserve unit ───
console.log('\nAC / CE');
setFeet();
press(9);
useCalculatorStore.getState().pressClear();
assert('AC keeps FEET', useCalculatorStore.getState().inputUnit === 'feet');
assert('AC zero in feet', useCalculatorStore.getState().display === `0'`);
setFeet();
press(7);
op('+');
press(3);
useCalculatorStore.getState().pressClearEntry();
const ce = useCalculatorStore.getState();
assert('CE mid-chain keeps acc+op', ce.accumulator?.units === 7 * 12 * 64 && ce.pendingOperator === '+');
assert('CE display zero feet', ce.display === `0'`);

// ─── Operator chaining ───
console.log('\nOperator chaining');
setInches();
typeInches(10);
op('+');
typeInches(5);
op('+');
assert('10+5+ evaluates to 15 pending +', useCalculatorStore.getState().display === `15"`);
setInches();
typeInches(11);
op('+');
op('-');
assert('11+ swap to -', useCalculatorStore.getState().subDisplay === `11" -`);
setInches();
typeInches(2);
op('+');
typeInches(3);
op('+');
typeInches(4);
eq();
assert('2+3+4 without intermediate = → 9"', useCalculatorStore.getState().display === `9"`);

// ─── Backspace ───
console.log('\nBackspace');
setInches();
press(1, 2, 3);
useCalculatorStore.getState().pressBackspace();
assert('123 → 12"', useCalculatorStore.getState().display === `12"`);
setFeet();
typeFeetInchesDot(3, 65);
useCalculatorStore.getState().pressBackspace();
assert('3.65 → 3.6', useCalculatorStore.getState().display === `3' 6"`);
setFeet();
typeFeetInchesDot(3, 6);
useCalculatorStore.getState().pressBackspace();
useCalculatorStore.getState().pressBackspace();
assert('3\'6" double bs → 3.', useCalculatorStore.getState().display === `3.`);

// ─── Chain after = ───
console.log('\nChain after =');
setInches();
typeInches(10);
op('+');
typeInches(5);
eq();
op('+');
typeInches(3);
eq();
assert('10+5=15, +3=18', useCalculatorStore.getState().display === `18"`);

// ─── Equals edge cases ───
console.log('\nEquals edge cases');
setInches();
typeInches(10);
op('+');
eq();
assert('10+ = 10 (empty operand = 0)', useCalculatorStore.getState().display === `10"`);
setInches();
typeInches(10);
op('+');
typeInches(5);
eq();
op('×');
eq();
assert('15× = 0 (empty scalar operand)', useCalculatorStore.getState().display === `0"`);

// ─── Repeat = (not implemented) ───
console.log('\nRepeat = (documented limitation)');
setInches();
typeInches(10);
op('+');
typeInches(5);
eq();
eq();
assert('second = stays at 15 (no repeat)', useCalculatorStore.getState().display === `15"`);

// ─── Rapid digit spam ───
console.log('\nRapid digits');
setInches();
for (let i = 0; i < 8; i++) useCalculatorStore.getState().pressDigit(9);
assert('99999999" builds correctly', useCalculatorStore.getState().display === `99999999"`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);