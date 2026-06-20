import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { calculateRoofing } from '../../src/engine/roofing';
import { useTheme } from '../../src/hooks/useTheme';

export default function RoofingScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [planArea, setPlanArea] = useState('');
  const [pitch, setPitch] = useState('7/12');

  const result = useMemo(() => {
    const area = parseFloat(planArea);
    if (!area || area <= 0) return null;
    const pitchParts = pitch.split('/');
    return calculateRoofing({
      planAreaSqFt: area,
      pitchRatio: {
        rise: parseFloat(pitchParts[0]) || 7,
        run: parseFloat(pitchParts[1]) || 12,
      },
    });
  }, [planArea, pitch]);

  return (
    <>
      <Stack.Screen options={{ title: 'Roofing Materials' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput
          label="Plan Area (sq ft)"
          value={planArea}
          onChangeText={setPlanArea}
          theme={theme}
          placeholder="1200"
        />
        <DimensionalInput label="Pitch" value={pitch} onChangeText={setPitch} theme={theme} placeholder="7/12" />

        {result && (
          <View style={styles.results}>
            <ResultRow label="Roof Area" value={`${result.roofArea} sq ft`} theme={theme} highlight />
            <ResultRow label="Squares (100 sq ft)" value={String(result.squares)} theme={theme} />
            <ResultRow label="Shingle Bundles" value={String(result.bundles)} theme={theme} />
            <ResultRow label="4×8 Sheets" value={String(result.sheets4x8)} theme={theme} />
          </View>
        )}
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  results: { marginTop: 8 },
});