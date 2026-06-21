/**
 * Cenários solicitados para validação de operações sequenciais.
 * Simula a store Zustand (mesma lógica do bundle web em produção).
 */
import { useCalculatorStore } from '../src/store/calculator';
import { useSettingsStore } from '../src/store/settings';
import { eq, op, resetCalculator, typeFeetInches, typeInches } from './test-helpers';

type Result = { label: string; pass: boolean; expected: string; actual: string; detail?: string };

const results: Result[] = [];

function record(label: string, expected: string, actual: string, detail?: string) {
  const pass = actual === expected;
  results.push({ label, pass, expected, actual, detail });
  console.log(pass ? `  ✓ ${label}` : `  ✗ ${label}`);
  if (!pass) {
    console.error(`    esperado: "${expected}"`);
    console.error(`    obtido:   "${actual}"`);
    if (detail) console.error(`    detalhe:  ${detail}`);
  }
}

function state() {
  const s = useCalculatorStore.getState();
  return { display: s.display, sub: s.subDisplay, op: s.pendingOperator };
}

console.log('Cenários do usuário — store local (espelha produção)\n');

useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });

// 1. Básico: 10 + 5 = 15, depois + 3 = 18
resetCalculator();
typeInches(10);
op('+');
typeInches(5);
eq();
record('Básico: 10 + 5 = 15', '15"', state().display);
op('+');
typeInches(3);
eq();
record('Básico: cadeia 15 + 3 = 18', '18"', state().display);

// 2. Divisão em cadeia: 24 / 2 = 12, / 3 = 4
resetCalculator();
typeInches(24);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
record('Divisão: 24 / 2 = 12', '12"', state().display);
op('÷');
useCalculatorStore.getState().pressDigit(3);
eq();
record('Divisão: cadeia 12 / 3 = 4', '4"', state().display);

// 3. Pés: 5' + 3'6" = 8'6" (toggle para feet)
resetCalculator();
typeInches(60);
op('+');
typeInches(42);
eq();
useCalculatorStore.getState().toggleInputUnit();
record("Pés: 5' + 3'6\" = 8'6\"", "8' 6\"", state().display);

// 4. Após =, operador usa o resultado
useSettingsStore.getState().updateSettings({ displayMode: 'in-frac', fractionResolution: 16 });
resetCalculator();
typeInches(10);
op('+');
typeInches(5);
eq();
const afterEq = state();
record('Após =: resultado visível', '15"', afterEq.display);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
record('Após =: operador usa resultado (15 / 2)', '7-1/2"', state().display);

// 5. Troca de operador sem recalcular
resetCalculator();
typeInches(11);
op('+');
const beforeSwap = state();
op('-');
const afterSwap = state();
record('Troca operador: display mantém 11"', '11"', afterSwap.display);
record('Troca operador: subDisplay vira "11" -"', '11" -', afterSwap.sub);
record(
  'Troca operador: sem recalcular (accumulator intacto)',
  '11"',
  beforeSwap.display,
  `pendingOp: ${afterSwap.op}`,
);

// 6. Frações rápidas em cadeias
resetCalculator();
typeInches(11);
useCalculatorStore.getState().pressQuickFraction(15, 16);
op('÷');
useCalculatorStore.getState().pressDigit(2);
eq();
record('Fração rápida: 11-15/16 / 2', '6"', state().display);
op('+');
useCalculatorStore.getState().pressQuickFraction(1, 2);
eq();
record('Fração rápida: cadeia 6" + 1/2" = 6-1/2"', '6-1/2"', state().display);

// 7. Toggle ft↔in no valor exibido
resetCalculator();
typeInches(72);
useCalculatorStore.getState().toggleInputUnit();
record('Toggle: 72" → 6\'', "6'", state().display);
useCalculatorStore.getState().toggleInputUnit();
record('Toggle: 6\' → 72"', '72"', state().display);

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${passed} passou, ${failed} falhou`);
process.exit(failed > 0 ? 1 : 0);