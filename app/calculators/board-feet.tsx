import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { calculateBoardFeet } from '../../src/engine/framing';
import { useTheme } from '../../src/hooks/useTheme';

export default function BoardFeetScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [thickness, setThickness] = useState('2');
  const [width, setWidth] = useState('6');
  const [length, setLength] = useState('8');

  const boardFeet = useMemo(() => {
    const t = parseFloat(thickness);
    const w = parseFloat(width);
    const l = parseFloat(length);
    if (!t || !w || !l) return null;
    return calculateBoardFeet(t, w, l);
  }, [thickness, width, length]);

  return (
    <>
      <Stack.Screen options={{ title: 'Board Feet' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Thickness (in)" value={thickness} onChangeText={setThickness} theme={theme} placeholder="2" />
        <DimensionalInput label="Width (in)" value={width} onChangeText={setWidth} theme={theme} placeholder="6" />
        <DimensionalInput label="Length (ft)" value={length} onChangeText={setLength} theme={theme} placeholder="8" />
        {boardFeet !== null && (
          <ResultRow label="Board Feet" value={`${boardFeet.toFixed(2)} BF`} theme={theme} highlight />
        )}
      </CalcFormLayout>
    </>
  );
}