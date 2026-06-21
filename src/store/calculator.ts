import { create } from 'zustand';
import {
  add,
  formatDimensional,
  fromDecimalInches,
  fromFeetInchesFraction,
  fromUnits,
  UNITS_PER_FOOT,
  UNITS_PER_INCH,
  subtract,
  toDecimalInches,
} from '../engine/dimensional';
import type { DimensionalValue, DisplayMode, InputUnit } from '../types';
import { useSettingsStore } from './settings';

type Operator = '+' | '-' | '×' | '÷' | null;
type InputMode = 'feet' | 'inches' | 'frac-num' | 'frac-den' | 'scalar' | 'idle';

export const QUICK_FRACTIONS = [
  { label: '1/8', num: 1, den: 8 },
  { label: '1/4', num: 1, den: 4 },
  { label: '3/8', num: 3, den: 8 },
  { label: '1/2', num: 1, den: 2 },
  { label: '5/8', num: 5, den: 8 },
  { label: '3/4', num: 3, den: 4 },
  { label: '7/8', num: 7, den: 8 },
] as const;

interface CalculatorStore {
  display: string;
  subDisplay: string;
  inputHint: string;
  accumulator: DimensionalValue | null;
  pendingOperator: Operator;
  inputMode: InputMode;
  currentFeet: number;
  currentInches: number;
  fracNum: number;
  fracDen: number;
  inputUnit: InputUnit;
  lastResult: DimensionalValue | null;
  isNewEntry: boolean;

  pressDigit: (digit: number) => void;
  toggleInputUnit: () => void;
  pressFraction: () => void;
  pressDenominator: (den: number) => void;
  pressQuickFraction: (num: number, den: number) => void;
  pressOperator: (op: Operator) => void;
  pressEquals: () => void;
  pressClear: () => void;
  pressClearEntry: () => void;
  pressBackspace: () => void;
  pressSign: () => void;
  pressSquare: () => void;
  pressSqrt: () => void;
  pressPi: () => void;
  setDisplayFromValue: (value: DimensionalValue) => void;
  refreshDisplayFormat: () => void;
}

function getSettings() {
  const { fractionResolution, displayMode } = useSettingsStore.getState();
  return { fractionResolution, displayMode };
}

function getDefaultInputUnit(): InputUnit {
  return useSettingsStore.getState().defaultInputUnit ?? 'inches';
}

function displayModeForUnit(unit: InputUnit): DisplayMode {
  return unit === 'feet' ? 'ft-in-frac' : 'in-frac';
}

function zeroDisplay(unit: InputUnit): string {
  return unit === 'feet' ? `0'` : `0"`;
}

function hasCompleteFraction(state: Pick<CalculatorStore, 'fracNum' | 'fracDen'>): boolean {
  return state.fracNum > 0 && state.fracDen > 1;
}

function buildCurrentValue(state: CalculatorStore): DimensionalValue {
  if (state.inputMode === 'scalar') {
    const n = state.currentInches || state.currentFeet;
    return fromFeetInchesFraction(0, n, 0, 1);
  }

  const fractionActive = hasCompleteFraction(state);
  return fromFeetInchesFraction(
    state.currentFeet,
    state.currentInches,
    fractionActive ? state.fracNum : 0,
    fractionActive ? state.fracDen : 1,
  );
}

function getActiveValue(state: CalculatorStore): DimensionalValue {
  const useLastResult =
    state.isNewEntry &&
    state.lastResult &&
    !state.accumulator &&
    !state.pendingOperator &&
    state.inputMode === 'idle';

  return useLastResult ? state.lastResult! : buildCurrentValue(state);
}

function formatValue(value: DimensionalValue, unit: InputUnit): string {
  if (value.units === 0) return zeroDisplay(unit);
  const { fractionResolution } = getSettings();
  return formatDimensional(value, fractionResolution, displayModeForUnit(unit));
}

function valueToEntryFields(
  value: DimensionalValue,
): Pick<CalculatorStore, 'currentFeet' | 'currentInches' | 'fracNum' | 'fracDen'> {
  const negative = value.units < 0;
  const absUnits = Math.abs(value.units);
  const feet = Math.floor(absUnits / UNITS_PER_FOOT);
  const inchUnits = absUnits % UNITS_PER_FOOT;
  const wholeInches = Math.floor(inchUnits / UNITS_PER_INCH);
  const fracUnits = inchUnits % UNITS_PER_INCH;
  const { fractionResolution } = getSettings();
  let fracNum = 0;
  let fracDen = 1;
  if (fracUnits > 0) {
    fracNum = Math.round((fracUnits / UNITS_PER_INCH) * fractionResolution);
    fracDen = fractionResolution;
  }
  return {
    currentFeet: negative ? -feet : feet,
    currentInches: wholeInches,
    fracNum,
    fracDen: fracNum > 0 ? fracDen : 0,
  };
}

function appendFraction(base: string, num: string, den: string, unit: InputUnit): string {
  if (unit === 'feet') {
    const stripped = base.replace(/"$/, '').replace(/'$/, '').trim();
    if (!num && !den) return `${stripped}-▸⁄▸"`;
    if (num && !den) return `${stripped}-${num}⁄▸"`;
    return `${stripped}-${num}/${den}"`;
  }
  const stripped = base.replace(/"$/, '');
  if (!num && !den) return `${stripped}-▸⁄▸"`;
  if (num && !den) return `${stripped}-${num}⁄▸"`;
  return `${stripped}-${num}/${den}"`;
}

function formatInputDisplay(state: CalculatorStore): string {
  const { fractionResolution } = getSettings();
  const mode = displayModeForUnit(state.inputUnit);

  if (state.inputMode === 'frac-num') {
    const base = formatDimensional(buildCurrentValue(state), fractionResolution, mode);
    const num = state.fracNum > 0 ? String(state.fracNum) : '';
    return appendFraction(base, num, '', state.inputUnit);
  }

  if (state.inputMode === 'frac-den') {
    const base = formatDimensional(buildCurrentValue(state), fractionResolution, mode);
    const den = state.fracDen > 0 ? String(state.fracDen) : '';
    return appendFraction(base, String(state.fracNum), den, state.inputUnit);
  }

  if (hasCompleteFraction(state)) {
    const base = formatDimensional(
      fromFeetInchesFraction(state.currentFeet, state.currentInches, 0, 1),
      fractionResolution,
      mode,
    );
    return appendFraction(base, String(state.fracNum), String(state.fracDen), state.inputUnit);
  }

  if (state.inputMode === 'scalar') {
    return String(state.currentInches || state.currentFeet);
  }

  return formatDimensional(buildCurrentValue(state), fractionResolution, mode);
}

function getInputHint(unit: InputUnit, mode: InputMode, fracNum: number): string {
  switch (mode) {
    case 'feet':
      return 'Enter feet';
    case 'inches':
      return unit === 'feet' ? 'Enter inches · fraction keys for 7/8…' : 'Enter inches · fraction keys for 7/8…';
    case 'frac-num':
      return fracNum > 0
        ? 'Tap a⁄c — then type bottom number (e.g. 1 6 for /16)'
        : 'Type top number (e.g. 1 5 for 15/…)';
    case 'frac-den':
      return 'Type bottom number on keypad (2, 4, 8, or 1 6 for 16)';
    case 'scalar':
      return unit === 'feet' ? 'Enter feet' : 'Enter inches';
    default:
      return unit === 'feet'
        ? 'Feet mode · tap unit above to switch'
        : 'Inches mode · tap unit above to switch';
  }
}

function updateDisplay(set: (partial: Partial<CalculatorStore>) => void, get: () => CalculatorStore) {
  const state = get();
  set({
    display: formatInputDisplay(state),
    inputHint: getInputHint(state.inputUnit, state.inputMode, state.fracNum),
  });
}

function resetEntry(state: CalculatorStore): Partial<CalculatorStore> {
  return {
    currentFeet: 0,
    currentInches: 0,
    fracNum: 0,
    fracDen: 0,
    inputMode: 'idle',
    isNewEntry: true,
  };
}

function startDigitEntry(state: CalculatorStore, digit: number): Partial<CalculatorStore> {
  if (state.inputUnit === 'feet') {
    return {
      ...resetEntry(state),
      isNewEntry: false,
      inputMode: 'feet',
      currentFeet: digit,
    };
  }
  return {
    ...resetEntry(state),
    isNewEntry: false,
    inputMode: 'inches',
    currentInches: digit,
  };
}

function isScalarOperator(op: Operator): boolean {
  return op === '×' || op === '÷';
}

function startScalarEntry(state: CalculatorStore, digit: number): Partial<CalculatorStore> {
  return {
    ...resetEntry(state),
    isNewEntry: false,
    inputMode: 'scalar',
    currentInches: digit,
    currentFeet: 0,
  };
}

function finalizeFractionEntry(
  set: (partial: Partial<CalculatorStore>) => void,
  get: () => CalculatorStore,
  num: number,
  den: number,
) {
  set({
    fracNum: num,
    fracDen: den,
    inputMode: 'inches',
    isNewEntry: false,
  });
  updateDisplay(set, get);
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  display: '0"',
  subDisplay: '',
  inputHint: 'Inches mode · tap unit above to switch',
  accumulator: null,
  pendingOperator: null,
  inputMode: 'idle',
  currentFeet: 0,
  currentInches: 0,
  fracNum: 0,
  fracDen: 0,
  inputUnit: 'inches',
  lastResult: null,
  isNewEntry: true,

  pressDigit: (digit) => {
    const state = get();

    if (state.isNewEntry && state.pendingOperator) {
      if (isScalarOperator(state.pendingOperator)) {
        set(startScalarEntry(state, digit));
      } else {
        set(startDigitEntry(state, digit));
      }
      updateDisplay(set, get);
      return;
    }

    if (state.isNewEntry) {
      set(startDigitEntry(state, digit));
      updateDisplay(set, get);
      return;
    }

    if (state.inputMode === 'scalar') {
      set({ currentInches: state.currentInches * 10 + digit, isNewEntry: false });
    } else if (state.inputMode === 'feet') {
      set({ currentFeet: state.currentFeet * 10 + digit, isNewEntry: false });
    } else if (state.inputMode === 'inches') {
      set({ currentInches: state.currentInches * 10 + digit, isNewEntry: false, fracNum: 0, fracDen: 0 });
    } else if (state.inputMode === 'frac-num') {
      set({ fracNum: state.fracNum * 10 + digit, isNewEntry: false });
    } else if (state.inputMode === 'frac-den') {
      const newDen = state.fracDen * 10 + digit;
      set({
        fracDen: newDen,
        isNewEntry: false,
        ...(newDen > 1 ? { inputMode: 'inches' as InputMode } : {}),
      });
    } else if (state.inputUnit === 'feet') {
      set({ inputMode: 'feet', currentFeet: digit, isNewEntry: false });
    } else {
      set({ inputMode: 'inches', currentInches: digit, isNewEntry: false });
    }
    updateDisplay(set, get);
  },

  toggleInputUnit: () => {
    const state = get();
    const newUnit: InputUnit = state.inputUnit === 'inches' ? 'feet' : 'inches';
    const val = getActiveValue(state);
    const inChain = !!(state.accumulator && state.pendingOperator);
    const fields = valueToEntryFields(val);

    const patch: Partial<CalculatorStore> = {
      inputUnit: newUnit,
      ...fields,
      display: formatValue(val, newUnit),
      inputMode: inChain && !state.isNewEntry ? state.inputMode : 'idle',
      isNewEntry: inChain ? state.isNewEntry : true,
      lastResult: inChain ? state.lastResult : val,
      inputHint: getInputHint(newUnit, 'idle', 0),
    };

    if (state.accumulator && state.pendingOperator) {
      patch.subDisplay = `${formatValue(state.accumulator, newUnit)} ${state.pendingOperator}`;
    }

    set(patch);
  },

  pressFraction: () => {
    const state = get();
    if (state.inputMode === 'frac-num' && state.fracNum > 0) {
      set({ inputMode: 'frac-den', fracDen: 0 });
    } else {
      set({ inputMode: 'frac-num', fracNum: 0, fracDen: 0, isNewEntry: false });
    }
    updateDisplay(set, get);
  },

  pressDenominator: (den) => {
    const state = get();
    if (state.inputMode === 'frac-num' && state.fracNum > 0) {
      finalizeFractionEntry(set, get, state.fracNum, den);
      return;
    }
    if (state.inputMode === 'frac-den') {
      finalizeFractionEntry(set, get, state.fracNum, den);
      return;
    }
    if (state.inputMode === 'inches' || state.inputMode === 'idle') {
      finalizeFractionEntry(set, get, 1, den);
    }
  },

  pressQuickFraction: (num, den) => {
    const state = get();
    if (state.inputMode === 'idle' && state.isNewEntry) {
      set({
        inputMode: state.inputUnit === 'feet' ? 'feet' : 'inches',
        currentFeet: 0,
        currentInches: 0,
        isNewEntry: false,
      });
    }
    finalizeFractionEntry(set, get, num, den);
  },

  pressOperator: (op) => {
    const state = get();

    if (state.isNewEntry && state.accumulator && state.pendingOperator) {
      set({
        pendingOperator: op,
        subDisplay: `${formatValue(state.accumulator, state.inputUnit)} ${op}`,
        inputHint: 'Enter next value',
      });
      return;
    }

    const current = getActiveValue(state);

    if (state.accumulator && state.pendingOperator && !state.isNewEntry) {
      const result = applyOperator(state.accumulator, current, state.pendingOperator);
      set({
        accumulator: result,
        display: formatValue(result, state.inputUnit),
        subDisplay: `${formatValue(result, state.inputUnit)} ${op}`,
        inputHint: 'Enter next value',
        pendingOperator: op,
        ...resetEntry(state),
      });
    } else {
      set({
        accumulator: current,
        display: formatValue(current, state.inputUnit),
        subDisplay: `${formatValue(current, state.inputUnit)} ${op}`,
        inputHint: 'Enter next value',
        pendingOperator: op,
        ...resetEntry(state),
      });
    }
  },

  pressEquals: () => {
    const state = get();
    if (!state.accumulator || !state.pendingOperator) return;

    const current = buildCurrentValue(state);
    const result = applyOperator(state.accumulator, current, state.pendingOperator);
    const expression = `${formatValue(state.accumulator, state.inputUnit)} ${state.pendingOperator} ${formatValue(current, state.inputUnit)}`;

    set({
      display: formatValue(result, state.inputUnit),
      subDisplay: expression,
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
      accumulator: null,
      pendingOperator: null,
      lastResult: result,
      ...resetEntry(state),
    });
  },

  pressClear: () => {
    const unit = get().inputUnit;
    set({
      display: zeroDisplay(unit),
      subDisplay: '',
      inputHint: getInputHint(unit, 'idle', 0),
      accumulator: null,
      pendingOperator: null,
      lastResult: null,
      currentFeet: 0,
      currentInches: 0,
      fracNum: 0,
      fracDen: 0,
      inputMode: 'idle',
      isNewEntry: true,
    });
  },

  pressClearEntry: () => {
    const state = get();
    set({
      ...resetEntry(state),
      display: zeroDisplay(state.inputUnit),
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
    });
  },

  pressBackspace: () => {
    const state = get();
    if (state.inputMode === 'frac-den') {
      set({ fracDen: Math.floor(state.fracDen / 10) });
    } else if (state.inputMode === 'frac-num') {
      const newNum = Math.floor(state.fracNum / 10);
      set({ fracNum: newNum });
      if (newNum === 0) set({ inputMode: 'inches' });
    } else if (state.inputMode === 'scalar') {
      const newVal = Math.floor(state.currentInches / 10);
      set({ currentInches: newVal });
      if (newVal === 0) set({ inputMode: 'idle', isNewEntry: true });
    } else if (state.inputMode === 'inches') {
      const newInches = Math.floor(state.currentInches / 10);
      set({ currentInches: newInches, fracNum: 0, fracDen: 0 });
    } else if (state.inputMode === 'feet') {
      set({ currentFeet: Math.floor(state.currentFeet / 10) });
    }
    updateDisplay(set, get);
  },

  pressSign: () => {
    const state = get();
    const val = getActiveValue(state);
    const negated = fromUnits(-val.units);
    set({
      display: formatValue(negated, state.inputUnit),
      lastResult: negated,
      ...resetEntry(state),
    });
  },

  pressSquare: () => {
    const state = get();
    const val = getActiveValue(state);
    const squared = fromDecimalInches(toDecimalInches(val) ** 2);
    set({
      display: formatValue(squared, state.inputUnit),
      lastResult: squared,
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
      ...resetEntry(state),
    });
  },

  pressSqrt: () => {
    const state = get();
    const val = getActiveValue(state);
    const inches = toDecimalInches(val);
    if (inches < 0) return;
    const result = fromDecimalInches(Math.sqrt(inches));
    set({
      display: formatValue(result, state.inputUnit),
      lastResult: result,
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
      ...resetEntry(state),
    });
  },

  pressPi: () => {
    const state = get();
    const result = fromDecimalInches(Math.PI);
    set({
      display: formatValue(result, state.inputUnit),
      lastResult: result,
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
      ...resetEntry(state),
    });
  },

  setDisplayFromValue: (value) => {
    const state = get();
    set({
      display: formatValue(value, state.inputUnit),
      lastResult: value,
      inputHint: getInputHint(state.inputUnit, 'idle', 0),
      ...resetEntry(get()),
    });
  },

  refreshDisplayFormat: () => {
    const state = get();
    if (state.pendingOperator && state.accumulator) {
      set({
        display: formatInputDisplay(state),
        subDisplay: `${formatValue(state.accumulator, state.inputUnit)} ${state.pendingOperator}`,
        inputHint: getInputHint(state.inputUnit, state.inputMode, state.fracNum),
      });
      return;
    }
    if (state.lastResult && state.isNewEntry && state.inputMode === 'idle') {
      set({ display: formatValue(state.lastResult, state.inputUnit) });
      return;
    }
    updateDisplay(set, get);
  },
}));

function getScalarValue(value: DimensionalValue): number {
  return toDecimalInches(value);
}

function applyOperator(
  a: DimensionalValue,
  b: DimensionalValue,
  op: Operator,
): DimensionalValue {
  switch (op) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '×':
      return fromDecimalInches(toDecimalInches(a) * getScalarValue(b));
    case '÷': {
      const divisor = getScalarValue(b);
      if (divisor === 0) return a;
      return fromDecimalInches(toDecimalInches(a) / divisor);
    }
    default:
      return b;
  }
}