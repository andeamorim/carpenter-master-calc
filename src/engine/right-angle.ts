import type { DimensionalValue, RightAngleResult } from '../types';
import {
  fromDecimalInches,
  fromUnits,
  sqrt,
  toDecimalInches,
} from './dimensional';

const DEG = 180 / Math.PI;

export function pitchRatioToDegrees(rise: number, run = 12): number {
  return Math.atan(rise / run) * DEG;
}

export function degreesToPitchRatio(degrees: number): { rise: number; run: number } {
  const rise = Math.tan((degrees * Math.PI) / 180) * 12;
  return { rise: Math.round(rise * 100) / 100, run: 12 };
}

export function percentToDegrees(percent: number): number {
  return Math.atan(percent / 100) * DEG;
}

export function solveRightAngle(params: {
  rise?: DimensionalValue;
  run?: DimensionalValue;
  diagonal?: DimensionalValue;
  pitchRatio?: { rise: number; run: number };
  pitchDegrees?: number;
  pitchPercent?: number;
}): RightAngleResult | null {
  let rise = params.rise;
  let run = params.run;
  const diagonal = params.diagonal;

  let pitchDegrees = params.pitchDegrees;
  if (params.pitchRatio) {
    pitchDegrees = pitchRatioToDegrees(params.pitchRatio.rise, params.pitchRatio.run);
  } else if (params.pitchPercent !== undefined) {
    pitchDegrees = percentToDegrees(params.pitchPercent);
  }

  if (pitchDegrees !== undefined && run && !rise) {
    const riseInches = toDecimalInches(run) * Math.tan((pitchDegrees * Math.PI) / 180);
    rise = fromDecimalInches(riseInches);
  } else if (pitchDegrees !== undefined && rise && !run) {
    const runInches = toDecimalInches(rise) / Math.tan((pitchDegrees * Math.PI) / 180);
    run = fromDecimalInches(runInches);
  }

  if (rise && run && !diagonal) {
    const riseIn = toDecimalInches(rise);
    const runIn = toDecimalInches(run);
    const diagIn = Math.sqrt(riseIn * riseIn + runIn * runIn);
    const angle = Math.atan(riseIn / runIn) * DEG;
    return buildResult(rise, run, fromDecimalInches(diagIn), angle);
  }

  if (rise && diagonal && !run) {
    const riseIn = toDecimalInches(rise);
    const diagIn = toDecimalInches(diagonal);
    if (diagIn < riseIn) return null;
    const runIn = Math.sqrt(diagIn * diagIn - riseIn * riseIn);
    const angle = Math.atan(riseIn / runIn) * DEG;
    return buildResult(rise, fromDecimalInches(runIn), diagonal, angle);
  }

  if (run && diagonal && !rise) {
    const runIn = toDecimalInches(run);
    const diagIn = toDecimalInches(diagonal);
    if (diagIn < runIn) return null;
    const riseIn = Math.sqrt(diagIn * diagIn - runIn * runIn);
    const angle = Math.atan(riseIn / runIn) * DEG;
    return buildResult(fromDecimalInches(riseIn), run, diagonal, angle);
  }

  if (rise && run) {
    const riseIn = toDecimalInches(rise);
    const runIn = toDecimalInches(run);
    const diagIn = Math.sqrt(riseIn * riseIn + runIn * runIn);
    const angle = Math.atan(riseIn / runIn) * DEG;
    return buildResult(rise, run, fromDecimalInches(diagIn), angle);
  }

  return null;
}

function buildResult(
  rise: DimensionalValue,
  run: DimensionalValue,
  diagonal: DimensionalValue,
  pitchDegrees: number,
): RightAngleResult {
  const riseIn = toDecimalInches(rise);
  const runIn = toDecimalInches(run);
  const ratioRise = Math.round((riseIn / runIn) * 12 * 100) / 100;
  const pitchPercent = Math.round((riseIn / runIn) * 10000) / 100;

  return {
    rise,
    run,
    diagonal,
    pitchRatio: `${ratioRise}/12`,
    pitchDegrees: Math.round(pitchDegrees * 10000) / 10000,
    pitchPercent,
    plumbCutAngle: pitchDegrees,
    levelCutAngle: 90 - pitchDegrees,
  };
}

export function calcDiagonal(rise: DimensionalValue, run: DimensionalValue): DimensionalValue {
  const riseIn = toDecimalInches(rise);
  const runIn = toDecimalInches(run);
  return fromDecimalInches(Math.sqrt(riseIn * riseIn + runIn * runIn));
}