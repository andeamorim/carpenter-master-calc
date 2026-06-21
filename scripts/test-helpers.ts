import { useCalculatorStore } from '../src/store/calculator';

export function resetCalculator() {
  const calc = useCalculatorStore.getState();
  if (calc.inputUnit === 'feet') calc.toggleInputUnit();
  calc.pressClear();
}

export function typeInches(n: number) {
  for (const d of String(n)) useCalculatorStore.getState().pressDigit(Number(d));
}

/** Enter a length as total inches (e.g. 5'6" → 66). */
export function typeFeetInches(feet: number, inches: number) {
  typeInches(feet * 12 + inches);
}

export function eq() {
  useCalculatorStore.getState().pressEquals();
}

export function op(symbol: '+' | '-' | '×' | '÷') {
  useCalculatorStore.getState().pressOperator(symbol);
}

/** Feet mode: 3.6 → 3'6" */
export function typeFeetInchesDot(feet: number, inches: number) {
  const calc = useCalculatorStore.getState();
  if (calc.inputUnit === 'inches') calc.toggleInputUnit();
  for (const d of String(feet)) calc.pressDigit(Number(d));
  calc.pressDecimal();
  if (inches > 0) {
    for (const d of String(inches)) calc.pressDigit(Number(d));
  }
}