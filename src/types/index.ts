export type FractionResolution = 2 | 4 | 8 | 16 | 32 | 64;

export type DisplayMode = 'ft-in-frac' | 'ft-decimal' | 'in-frac' | 'decimal-in';

export type PitchInputMode = 'ratio' | 'degrees' | 'percent' | 'rise-run';

export interface DimensionalValue {
  /** Internal 1/64" units */
  units: number;
}

export interface AppSettings {
  fractionResolution: FractionResolution;
  displayMode: DisplayMode;
  defaultStudSpacing: 16 | 24;
  defaultRiserHeight: DimensionalValue;
  defaultTreadWidth: DimensionalValue;
  defaultHeadroom: DimensionalValue;
  defaultFloorThickness: DimensionalValue;
  darkMode: boolean;
}

export interface TapeEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface RightAngleResult {
  rise: DimensionalValue;
  run: DimensionalValue;
  diagonal: DimensionalValue;
  pitchRatio: string;
  pitchDegrees: number;
  pitchPercent: number;
  plumbCutAngle: number;
  levelCutAngle: number;
}

export interface StairResult {
  totalRise: DimensionalValue;
  totalRun: DimensionalValue;
  numberOfRisers: number;
  actualRiserHeight: DimensionalValue;
  riserOverUnder: DimensionalValue;
  numberOfTreads: number;
  treadWidth: DimensionalValue;
  stringerLength: DimensionalValue;
  inclineAngle: number;
  headroomOk: boolean;
  headroomClearance: DimensionalValue;
}

export interface JackRafterEntry {
  index: number;
  length: DimensionalValue;
}

export interface RafterResult {
  commonRafterLength: DimensionalValue;
  hipRafterLength: DimensionalValue;
  jackRafters: JackRafterEntry[];
  plumbCutAngle: number;
  levelCutAngle: number;
}

export interface StudResult {
  wallLength: DimensionalValue;
  spacing: number;
  studCount: number;
  plateLinearFeet: DimensionalValue;
}

export interface RoofingResult {
  planArea: number;
  roofArea: number;
  squares: number;
  bundles: number;
  sheets4x8: number;
}

export interface EZCalcItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  premium: boolean;
}