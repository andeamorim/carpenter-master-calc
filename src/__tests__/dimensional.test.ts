import {
  add,
  formatDimensional,
  fromFeetInchesFraction,
  parseDimensionalInput,
  subtract,
} from '../engine/dimensional';

describe('dimensional engine', () => {
  test('formats feet-inch-fraction', () => {
    const val = fromFeetInchesFraction(12, 6, 1, 2);
    expect(formatDimensional(val, 16)).toBe(`12' 6-1/2"`);
  });

  test('adds mixed dimensions', () => {
    const a = fromFeetInchesFraction(12, 6, 0, 1);
    const b = fromFeetInchesFraction(3, 4, 1, 2);
    const result = add(a, b);
    expect(formatDimensional(result, 16)).toBe(`15' 10-1/2"`);
  });

  test('subtracts dimensions', () => {
    const a = fromFeetInchesFraction(10, 0, 0, 1);
    const b = fromFeetInchesFraction(2, 6, 0, 1);
    const result = subtract(a, b);
    expect(formatDimensional(result, 16)).toBe(`7' 6"`);
  });

  test('parses dimensional input', () => {
    const val = parseDimensionalInput(`12' 6-1/2"`);
    expect(val).not.toBeNull();
    expect(formatDimensional(val!, 16)).toBe(`12' 6-1/2"`);
  });

  test('in-frac mode shows total inches', () => {
    const a = fromFeetInchesFraction(0, 11, 0, 1);
    const b = fromFeetInchesFraction(0, 2, 0, 1);
    expect(formatDimensional(add(a, b), 16, 'in-frac')).toBe(`13"`);
  });
});