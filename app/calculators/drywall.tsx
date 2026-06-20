import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { calculateDrywallSheets } from '../../src/engine/framing';
import { useTheme } from '../../src/hooks/useTheme';

export default function DrywallScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [area, setArea] = useState('');
  const [sheetW, setSheetW] = useState('4');
  const [sheetH, setSheetH] = useState('8');

  const sheets = useMemo(() => {
    const a = parseFloat(area);
    const w = parseFloat(sheetW) || 4;
    const h = parseFloat(sheetH) || 8;
    if (!a || a <= 0) return null;
    return calculateDrywallSheets(a, w, h);
  }, [area, sheetW, sheetH]);

  return (
    <>
      <Stack.Screen options={{ title: 'Drywall Sheets' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Wall Area (sq ft)" value={area} onChangeText={setArea} theme={theme} placeholder="480" />
        <DimensionalInput label="Sheet Width (ft)" value={sheetW} onChangeText={setSheetW} theme={theme} placeholder="4" />
        <DimensionalInput label="Sheet Height (ft)" value={sheetH} onChangeText={setSheetH} theme={theme} placeholder="8" />
        {sheets !== null && (
          <ResultRow label="Sheets Needed" value={String(sheets)} theme={theme} highlight />
        )}
      </CalcFormLayout>
    </>
  );
}