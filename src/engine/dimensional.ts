import type { DimensionalValue, DisplayMode, FractionResolution } from '../types';

/** Internal storage: 1/64" precision (finer than any display setting). */
export const UNITS_PER_INCH = 64;
export const INCHES_PER_FOOT = 12;
export const UNITS_PER_FOOT = UNITS_PER_INCH * INCHES_PER_FOOT;

/** @deprecated Use UNITS_PER_INCH — kept for transitional imports */
export const SIXTEENTHS_PER_INCH = UNITS_PER_INCH;
export const SIXTEENTHS_PER_FOOT = UNITS_PER_FOOT;

export function fromUnits(units: number): DimensionalValue {
  return { units: Math.round(units) };
}

/** @deprecated Use fromUnits */
export function fromSixteenths(units: number): DimensionalValue {
  return fromUnits(units);
}

export function fromFeetInchesFraction(
  feet = 0,
  inches = 0,
  numerator = 0,
  denominator = 1,
): DimensionalValue {
  const inchUnits =
    inches * UNITS_PER_INCH +
    (denominator > 0 ? Math.round((numerator / denominator) * UNITS_PER_INCH) : 0);
  return { units: feet * UNITS_PER_FOOT + inchUnits };
}

export function fromDecimalInches(inches: number): DimensionalValue {
  return { units: Math.round(inches * UNITS_PER_INCH) };
}

export function fromDecimalFeet(feet: number): DimensionalValue {
  return { units: Math.round(feet * UNITS_PER_FOOT) };
}

export function toDecimalInches(value: DimensionalValue): number {
  return value.units / UNITS_PER_INCH;
}

export function toDecimalFeet(value: DimensionalValue): number {
  return value.units / UNITS_PER_FOOT;
}

export function add(a: DimensionalValue, b: DimensionalValue): DimensionalValue {
  return fromUnits(a.units + b.units);
}

export function subtract(a: DimensionalValue, b: DimensionalValue): DimensionalValue {
  return fromUnits(a.units - b.units);
}

export function multiply(a: DimensionalValue, scalar: number): DimensionalValue {
  return fromDecimalInches(toDecimalInches(a) * scalar);
}

export function divide(a: DimensionalValue, scalar: number): DimensionalValue {
  if (scalar === 0) throw new Error('Division by zero');
  return fromDecimalInches(toDecimalInches(a) / scalar);
}

export function abs(value: DimensionalValue): DimensionalValue {
  return fromUnits(Math.abs(value.units));
}

export function sqrt(value: DimensionalValue): DimensionalValue {
  const inches = toDecimalInches(value);
  if (inches < 0) throw new Error('Cannot sqrt negative value');
  return fromDecimalInches(Math.sqrt(inches));
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

function roundToResolution(units: number, resolution: FractionResolution): number {
  const unitsPerFraction = UNITS_PER_INCH / resolution;
  return Math.round(units / unitsPerFraction) * unitsPerFraction;
}

function formatFraction(numerator: number, denominator: number): string {
  if (numerator === 0) return '';
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return `${n}/${d}`;
}

export function formatDimensional(
  value: DimensionalValue,
  resolution: FractionResolution = 16,
  mode: DisplayMode = 'ft-in-frac',
): string {
  const rounded = roundToResolution(value.units, resolution);
  const isNegative = rounded < 0;
  const absUnits = Math.abs(rounded);

  if (mode === 'decimal-in') {
    return `${isNegative ? '-' : ''}${(absUnits / UNITS_PER_INCH).toFixed(4)}"`;
  }

  if (mode === 'ft-decimal') {
    return `${isNegative ? '-' : ''}${(absUnits / UNITS_PER_FOOT).toFixed(4)}'`;
  }

  const sign = isNegative ? '-' : '';

  if (mode === 'in-frac') {
    const totalWholeInches = Math.floor(absUnits / UNITS_PER_INCH);
    const fracUnits = absUnits % UNITS_PER_INCH;
    const fracNumerator = Math.round((fracUnits / UNITS_PER_INCH) * resolution);
    const fracText = fracNumerator > 0 ? formatFraction(fracNumerator, resolution) : '';
    const inchPart =
      totalWholeInches > 0
        ? `${totalWholeInches}${fracText ? `-${fracText}` : ''}`
        : fracText || '0';
    return `${sign}${inchPart}"`;
  }

  const feet = Math.floor(absUnits / UNITS_PER_FOOT);
  const remaining = absUnits % UNITS_PER_FOOT;
  const wholeInches = Math.floor(remaining / UNITS_PER_INCH);
  const fracUnits = remaining % UNITS_PER_INCH;
  const fracNumerator = Math.round((fracUnits / UNITS_PER_INCH) * resolution);
  const fracText = fracNumerator > 0 ? formatFraction(fracNumerator, resolution) : '';

  if (feet === 0 && wholeInches === 0) {
    return `${sign}${fracText ? `${fracText}"` : '0"'}`;
  }

  if (feet === 0) {
    return `${sign}${wholeInches}${fracText ? `-${fracText}` : ''}"`;
  }

  if (wholeInches === 0 && !fracText) {
    return `${sign}${feet}'`;
  }

  return `${sign}${feet}' ${wholeInches}${fracText ? `-${fracText}` : ''}"`;
}

export function parseDimensionalInput(input: string): DimensionalValue | null {
  const cleaned = input.trim().replace(/″|"/g, '"').replace(/′|'/g, "'");
  if (!cleaned) return null;

  const feetInchMatch = cleaned.match(
    /^(-?)(\d+)'?\s*(\d+)?(?:[-\s](\d+)\/(\d+))?"?$/,
  );
  if (feetInchMatch) {
    const sign = feetInchMatch[1] === '-' ? -1 : 1;
    const feet = parseInt(feetInchMatch[2] || '0', 10);
    const inches = parseInt(feetInchMatch[3] || '0', 10);
    const num = parseInt(feetInchMatch[4] || '0', 10);
    const den = parseInt(feetInchMatch[5] || '1', 10);
    const val = fromFeetInchesFraction(feet, inches, num, den);
    return fromUnits(sign * val.units);
  }

  const fractionOnly = cleaned.match(/^(-?)(\d+)\/(\d+)"?$/);
  if (fractionOnly) {
    const sign = fractionOnly[1] === '-' ? -1 : 1;
    const num = parseInt(fractionOnly[2], 10);
    const den = parseInt(fractionOnly[3], 10);
    const val = fromFeetInchesFraction(0, 0, num, den);
    return fromUnits(sign * val.units);
  }

  const feetOnly = cleaned.match(/^(-?)(\d+(?:\.\d+)?)'$/);
  if (feetOnly) {
    const sign = feetOnly[1] === '-' ? -1 : 1;
    return fromUnits(sign * fromDecimalFeet(parseFloat(feetOnly[2])).units);
  }

  const inchesOnly = cleaned.match(/^(-?)(\d+(?:\.\d+)?)"?$/);
  if (inchesOnly) {
    const sign = inchesOnly[1] === '-' ? -1 : 1;
    return fromUnits(sign * fromDecimalInches(parseFloat(inchesOnly[2])).units);
  }

  const decimal = parseFloat(cleaned);
  if (!Number.isNaN(decimal)) {
    return fromDecimalInches(decimal);
  }

  return null;
}

export function convertUnits(
  value: DimensionalValue,
  target: 'feet' | 'inches' | 'yards' | 'meters' | 'cm' | 'mm',
): number {
  const inches = toDecimalInches(value);
  switch (target) {
    case 'feet':
      return inches / INCHES_PER_FOOT;
    case 'inches':
      return inches;
    case 'yards':
      return inches / 36;
    case 'meters':
      return inches * 0.0254;
    case 'cm':
      return inches * 2.54;
    case 'mm':
      return inches * 25.4;
    default:
      return inches;
  }
}