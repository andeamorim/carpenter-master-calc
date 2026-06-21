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
import type { DimensionalValue } from '../types';
import type { DisplayMode } from '../types';
import { useSettingsStore } from './settings';

type Operator = '+' | '-' | '×' | '÷' | null;
type InputMode = 'feet' | 'inches' | 'frac-num' | 'frac-den' | 'scalar' | 'idle';
type ViewMode = 'ft-in-frac' | 'in-frac';

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
  viewMode: ViewMode | null;
  lastResult: DimensionalValue | null;
  isNewEntry: boolean;

  pressDigit: (digit: number) => void;
  pressConvertToFeet: () => void;
  pressConvertToInches: () => void;
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

function hasCompleteFraction(state: Pick<CalculatorStore, 'fracNum' | 'fracDen'>): boolean {
  return state.fracNum > 0 && state.fracDen > 1;
}

function buildCurrentValue(state: CalculatorStore): DimensionalValue {
  const fractionActive = hasCompleteFraction(state);
  return fromFeetInchesFraction(
    state.currentFeet,
    state.currentInches,
    fractionActive ? state.fracNum : 0,
    fractionActive ? state.fracDen : 1,
  );
}

/** Displayed result after = when entry is idle, or the value being typed. */
function getActiveValue(state: CalculatorStore): DimensionalValue {
  const useLastResult =
    state.isNewEntry &&
    state.lastResult &&
    !state.accumulator &&
    !state.pendingOperator &&
    state.inputMode === 'idle';

  return useLastResult ? state.lastResult! : buildCurrentValue(state);
}

function effectiveDisplayMode(viewMode: ViewMode | null): DisplayMode {
  if (viewMode) return viewMode;
  return getSettings().displayMode;
}

function formatValue(value: DimensionalValue, viewMode: ViewMode | null = null): string {
  const { fractionResolution } = getSettings();
  return formatDimensional(value, fractionResolution, effectiveDisplayMode(viewMode));
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

function applyUnitConversion(
  set: (partial: Partial<CalculatorStore>) => void,
  get: () => CalculatorStore,
  targetView: ViewMode,
) {
  const state = get();
  const val = getActiveValue(state);
  const inChain = !!(state.accumulator && state.pendingOperator);
  const fields = valueToEntryFields(val);

  set({
    ...fields,
    display: formatValue(val, targetView),
    viewMode: targetView,
    inputMode: 'inches',
    isNewEntry: !inChain,
    lastResult: inChain ? state.lastResult : val,
    inputHint:
      targetView === 'ft-in-frac'
        ? 'Feet · tap ″ to show inches'
        : 'Inches · tap ′ to show feet',
  });
}

function formatInchesOnly(feet: number, inches: number): string {
  const { fractionResolution, displayMode } = getSettings();
  return formatDimensional(
    fromFeetInchesFraction(feet, inches, 0, 1),
    fractionResolution,
    displayMode,
  );
}

function formatInputDisplay(state: CalculatorStore): string {
  const base = formatInchesOnly(state.currentFeet, state.currentInches);

  if (state.inputMode === 'frac-num') {
    const num = state.fracNum > 0 ? String(state.fracNum) : '';
    return appendFraction(base, num, '');
  }

  if (state.inputMode === 'frac-den') {
    const den = state.fracDen > 0 ? String(state.fracDen) : '';
    return appendFraction(base, String(state.fracNum), den);
  }

  if (hasCompleteFraction(state)) {
    return appendFraction(base, String(state.fracNum), String(state.fracDen));
  }

  if (state.inputMode === 'scalar') {
    const scalar = state.currentInches || state.currentFeet;
    return String(scalar);
  }

  return base;
}

function appendFraction(base: string, num: string, den: string): string {
  const stripped = base.replace(/"$/, '');
  if (!num && !den) return `${stripped}-▸⁄▸"`;
  if (num && !den) return `${stripped}-${num}⁄▸"`;
  return `${stripped}-${num}/${den}"`;
}

function getInputHint(mode: InputMode, fracNum: number): string {
  switch (mode) {
    case 'feet':
      return 'Enter number · tap ′ for feet or ″ for inches';
    case 'inches':
      return 'Enter inches · tap a⁄c or a fraction key';
    case 'frac-num':
      return fracNum > 0
        ? 'Tap a⁄c — then type bottom number (e.g. 1 6 for /16)'
        : 'Type top number (e.g. 1 5 for 15/…)';
    case 'frac-den':
      return 'Type bottom number on keypad (2, 4, 8, or 1 6 for 16)';
    case 'scalar':
      return 'Enter plain number';
    default:
      return 'Tap numbers · ′ feet · ″ inches · fraction keys for 7/8…';
  }
}

function updateDisplay(set: (partial: Partial<CalculatorStore>) => void, get: () => CalculatorStore) {
  const state = get();
  set({
    display: formatInputDisplay(state),
    inputHint: getInputHint(state.inputMode, state.fracNum),
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
  display: '0',
  subDisplay: '',
  inputHint: 'Tap numbers · ′ feet · ″ inches · fraction keys for 7/8…',
  accumulator: null,
  pendingOperator: null,
  inputMode: 'idle',
  currentFeet: 0,
  currentInches: 0,
  fracNum: 0,
  fracDen: 0,
  viewMode: null,
  lastResult: null,
  isNewEntry: true,

  pressDigit: (digit) => {
    const state = get();

    if (state.isNewEntry && state.pendingOperator) {
      set({
        ...resetEntry(state),
        isNewEntry: false,
        inputMode: 'scalar',
        currentInches: digit,
      });
      updateDisplay(set, get);
      return;
    }

    if (state.isNewEntry) {
      set({
        ...resetEntry(state),
        isNewEntry: false,
        inputMode: 'inches',
        currentInches: digit,
      });
      updateDisplay(set, get);
      return;
    }

    if (state.inputMode === 'scalar') {
      const current = state.currentInches * 10 + digit;
      set({ currentInches: current, isNewEntry: false });
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
    } else {
      set({ inputMode: 'inches', currentInches: digit, isNewEntry: false });
    }
    updateDisplay(set, get);
  },

  pressConvertToFeet: () => {
    applyUnitConversion(set, get, 'ft-in-frac');
  },

  pressConvertToInches: () => {
    applyUnitConversion(set, get, 'in-frac');
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
        inputMode: 'inches',
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
        subDisplay: `${formatValue(state.accumulator, state.viewMode)} ${op}`,
        inputHint: 'Enter next value',
      });
      return;
    }

    const current = getActiveValue(state);

    if (state.accumulator && state.pendingOperator && !state.isNewEntry) {
      const result = applyOperator(state.accumulator, current, state.pendingOperator);
      set({
        accumulator: result,
        display: formatValue(result, state.viewMode),
        subDisplay: `${formatValue(result, state.viewMode)} ${op}`,
        inputHint: 'Enter next value',
        pendingOperator: op,
        ...resetEntry(state),
      });
    } else {
      set({
        accumulator: current,
        display: formatValue(current, state.viewMode),
        subDisplay: `${formatValue(current, state.viewMode)} ${op}`,
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
    const expression = `${formatValue(state.accumulator, state.viewMode)} ${state.pendingOperator} ${formatValue(current, state.viewMode)}`;

    set({
      display: formatValue(result, state.viewMode),
      subDisplay: expression,
      inputHint: getInputHint('idle', 0),
      accumulator: null,
      pendingOperator: null,
      lastResult: result,
      ...resetEntry(state),
    });
  },

  pressClear: () => {
    set({
      display: '0',
      subDisplay: '',
      inputHint: getInputHint('idle', 0),
      accumulator: null,
      pendingOperator: null,
      lastResult: null,
      viewMode: null,
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
    set({ ...resetEntry(state), display: '0', inputHint: getInputHint('idle', 0) });
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
      display: formatValue(negated, state.viewMode),
      lastResult: negated,
      ...resetEntry(state),
    });
  },

  pressSquare: () => {
    const state = get();
    const val = getActiveValue(state);
    const squared = fromDecimalInches(toDecimalInches(val) ** 2);
    set({
      display: formatValue(squared, state.viewMode),
      lastResult: squared,
      inputHint: getInputHint('idle', 0),
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
      display: formatValue(result, state.viewMode),
      lastResult: result,
      inputHint: getInputHint('idle', 0),
      ...resetEntry(state),
    });
  },

  pressPi: () => {
    const result = fromDecimalInches(Math.PI);
    set({
      display: formatValue(result, get().viewMode),
      lastResult: result,
      inputHint: getInputHint('idle', 0),
      ...resetEntry(get()),
    });
  },

  setDisplayFromValue: (value) => {
    const state = get();
    set({
      display: formatValue(value, state.viewMode),
      lastResult: value,
      inputHint: getInputHint('idle', 0),
      ...resetEntry(get()),
    });
  },

  refreshDisplayFormat: () => {
    const state = get();
    if (state.pendingOperator && state.accumulator) {
      set({
        display: formatInputDisplay(state),
        subDisplay: state.subDisplay,
        inputHint: getInputHint(state.inputMode, state.fracNum),
      });
      return;
    }
    if (state.lastResult && state.isNewEntry && state.inputMode === 'idle') {
      set({ display: formatValue(state.lastResult, state.viewMode) });
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