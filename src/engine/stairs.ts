import type { DimensionalValue, StairResult } from '../types';
import {
  fromDecimalInches,
  fromFeetInchesFraction,
  subtract,
  toDecimalInches,
} from './dimensional';

export function calculateStairs(params: {
  totalRise: DimensionalValue;
  desiredRiserHeight: DimensionalValue;
  desiredTreadWidth: DimensionalValue;
  headroomRequired: DimensionalValue;
  floorThickness: DimensionalValue;
  riserLimited?: boolean;
  maxRiserHeight?: DimensionalValue;
}): StairResult {
  const totalRiseIn = toDecimalInches(params.totalRise);
  let desiredRiserIn = toDecimalInches(params.desiredRiserHeight);

  if (params.riserLimited && params.maxRiserHeight) {
    const maxRiser = toDecimalInches(params.maxRiserHeight);
    if (desiredRiserIn > maxRiser) desiredRiserIn = maxRiser;
  }

  const numberOfRisers = Math.ceil(totalRiseIn / desiredRiserIn);
  const actualRiserIn = totalRiseIn / numberOfRisers;
  const actualRiser = fromDecimalInches(actualRiserIn);
  const riserOverUnder = fromDecimalInches(actualRiserIn - desiredRiserIn);

  const numberOfTreads = numberOfRisers - 1;
  const treadWidth = params.desiredTreadWidth;
  const totalRunIn = numberOfTreads * toDecimalInches(treadWidth);
  const totalRun = fromDecimalInches(totalRunIn);

  const stringerIn = Math.sqrt(totalRiseIn * totalRiseIn + totalRunIn * totalRunIn);
  const stringerLength = fromDecimalInches(stringerIn);
  const inclineAngle = Math.atan(totalRiseIn / totalRunIn) * (180 / Math.PI);

  const headroomRequiredIn = toDecimalInches(params.headroomRequired);
  const floorThicknessIn = toDecimalInches(params.floorThickness);
  const headroomClearanceIn = headroomRequiredIn - floorThicknessIn;
  const headroomClearance = fromDecimalInches(headroomClearanceIn);

  return {
    totalRise: params.totalRise,
    totalRun,
    numberOfRisers,
    actualRiserHeight: actualRiser,
    riserOverUnder,
    numberOfTreads,
    treadWidth,
    stringerLength,
    inclineAngle: Math.round(inclineAngle * 100) / 100,
    headroomOk: actualRiserIn <= headroomClearanceIn,
    headroomClearance,
  };
}

export const DEFAULT_STAIR_VALUES = {
  riserHeight: fromFeetInchesFraction(0, 7, 1, 2),
  treadWidth: fromFeetInchesFraction(0, 10, 0, 1),
  headroom: fromFeetInchesFraction(6, 8, 0, 1),
  floorThickness: fromFeetInchesFraction(0, 10, 0, 1),
  maxRiser: fromFeetInchesFraction(0, 7, 3, 4),
};