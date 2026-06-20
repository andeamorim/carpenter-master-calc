import type { DimensionalValue, StudResult } from '../types';
import { fromDecimalInches, toDecimalFeet, toDecimalInches } from './dimensional';

export function calculateStuds(
  wallLength: DimensionalValue,
  spacing: 16 | 24,
): StudResult {
  const lengthIn = toDecimalInches(wallLength);
  const studCount = Math.ceil(lengthIn / spacing) + 1;
  const plateLinearFeet = fromDecimalInches((lengthIn / 12) * 3);

  return {
    wallLength,
    spacing,
    studCount,
    plateLinearFeet,
  };
}

export function calculateBoardFeet(
  thicknessIn: number,
  widthIn: number,
  lengthFt: number,
): number {
  return (thicknessIn * widthIn * lengthFt) / 12;
}

export function calculateDrywallSheets(
  wallAreaSqFt: number,
  sheetWidth = 4,
  sheetHeight = 8,
): number {
  const sheetArea = sheetWidth * sheetHeight;
  return Math.ceil(wallAreaSqFt / sheetArea);
}