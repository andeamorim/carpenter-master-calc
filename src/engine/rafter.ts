import type { DimensionalValue, RafterResult } from '../types';
import { fromDecimalInches, toDecimalInches } from './dimensional';
import { solveRightAngle } from './right-angle';

export function calculateCommonRafter(
  run: DimensionalValue,
  pitchRatio: { rise: number; run: number },
): DimensionalValue | null {
  const result = solveRightAngle({ run, pitchRatio });
  return result?.diagonal ?? null;
}

export function calculateHipRafter(
  run: DimensionalValue,
  pitchRatio: { rise: number; run: number },
): DimensionalValue | null {
  const runIn = toDecimalInches(run);
  const pitchRise = pitchRatio.rise / pitchRatio.run;
  const hipRunIn = runIn;
  const riseIn = hipRunIn * pitchRise;
  const effectiveRun = hipRunIn / Math.SQRT2;
  const hipLengthIn = Math.sqrt(riseIn * riseIn + effectiveRun * effectiveRun * 2);
  return fromDecimalInches(hipLengthIn);
}

export function calculateJackRafters(
  commonLength: DimensionalValue,
  spacing: number,
  count: number,
  pitchDegrees: number,
): { index: number; length: DimensionalValue }[] {
  const spacingIn = spacing;
  const cosAngle = Math.cos((pitchDegrees * Math.PI) / 180);
  const decrement = cosAngle > 0 ? spacingIn / cosAngle : spacingIn;
  const commonIn = toDecimalInches(commonLength);

  const jacks: { index: number; length: DimensionalValue }[] = [];
  for (let i = 1; i <= count; i++) {
    const lengthIn = commonIn - (decrement * (i - 0.5));
    if (lengthIn > 0) {
      jacks.push({
        index: i,
        length: fromDecimalInches(lengthIn),
      });
    }
  }
  return jacks;
}

export function calculateRafterSet(params: {
  run: DimensionalValue;
  pitchRatio: { rise: number; run: number };
  jackSpacing: number;
  jackCount: number;
}): RafterResult | null {
  const common = calculateCommonRafter(params.run, params.pitchRatio);
  if (!common) return null;

  const hip = calculateHipRafter(params.run, params.pitchRatio);
  const rightAngle = solveRightAngle({ run: params.run, pitchRatio: params.pitchRatio });
  if (!rightAngle || !hip) return null;

  const jacks = calculateJackRafters(
    common,
    params.jackSpacing,
    params.jackCount,
    rightAngle.pitchDegrees,
  );

  return {
    commonRafterLength: common,
    hipRafterLength: hip,
    jackRafters: jacks,
    plumbCutAngle: rightAngle.plumbCutAngle,
    levelCutAngle: rightAngle.levelCutAngle,
  };
}