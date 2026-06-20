import type { RoofingResult } from '../types';

export function calculateRoofing(params: {
  planAreaSqFt: number;
  pitchRatio: { rise: number; run: number };
}): RoofingResult {
  const pitchRise = params.pitchRatio.rise / params.pitchRatio.run;
  const pitchAngle = Math.atan(pitchRise);
  const roofArea = params.planAreaSqFt / Math.cos(pitchAngle);
  const squares = roofArea / 100;
  const bundles = Math.ceil(roofArea / 33.33);
  const sheets4x8 = Math.ceil(roofArea / 32);

  return {
    planArea: params.planAreaSqFt,
    roofArea: Math.round(roofArea * 100) / 100,
    squares: Math.round(squares * 100) / 100,
    bundles,
    sheets4x8,
  };
}