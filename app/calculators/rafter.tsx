import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { formatDimensional, parseDimensionalInput } from '../../src/engine/dimensional';
import { calculateRafterSet } from '../../src/engine/rafter';
import { useTheme } from '../../src/hooks/useTheme';
import type { DimensionalValue } from '../../src/types';
import { useSettingsStore } from '../../src/store/settings';

export default function RafterScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const { fractionResolution, displayMode } = useSettingsStore();
  const [run, setRun] = useState('');
  const [pitch, setPitch] = useState('7/12');
  const [spacing, setSpacing] = useState('16');
  const [jackCount, setJackCount] = useState('5');

  const fmt = (v: DimensionalValue) =>
    formatDimensional(v, fractionResolution, displayMode);

  const result = useMemo(() => {
    const runVal = parseDimensionalInput(run);
    if (!runVal) return null;
    const pitchParts = pitch.split('/');
    const pitchRatio = {
      rise: parseFloat(pitchParts[0]) || 7,
      run: parseFloat(pitchParts[1]) || 12,
    };
    return calculateRafterSet({
      run: runVal,
      pitchRatio,
      jackSpacing: parseFloat(spacing) || 16,
      jackCount: parseInt(jackCount, 10) || 5,
    });
  }, [run, pitch, spacing, jackCount, fractionResolution, displayMode]);

  return (
    <>
      <Stack.Screen options={{ title: 'Rafter Solutions' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Run" value={run} onChangeText={setRun} theme={theme} />
        <DimensionalInput label="Pitch" value={pitch} onChangeText={setPitch} theme={theme} placeholder="7/12" />
        <DimensionalInput label="Jack Spacing (in)" value={spacing} onChangeText={setSpacing} theme={theme} placeholder="16" />
        <DimensionalInput label="Number of Jacks" value={jackCount} onChangeText={setJackCount} theme={theme} placeholder="5" />

        {result && (
          <View style={styles.results}>
            <ResultRow label="Common Rafter" value={fmt(result.commonRafterLength)} theme={theme} highlight />
            <ResultRow label="Hip Rafter" value={fmt(result.hipRafterLength)} theme={theme} highlight />
            <ResultRow label="Plumb Cut" value={`${result.plumbCutAngle.toFixed(2)}°`} theme={theme} />
            <ResultRow label="Level Cut" value={`${result.levelCutAngle.toFixed(2)}°`} theme={theme} />
            <Text style={[styles.jackTitle, { color: theme.text }]}>Jack Rafters</Text>
            {result.jackRafters.map((j) => (
              <ResultRow
                key={j.index}
                label={`Jack #${j.index}`}
                value={fmt(j.length)}
                theme={theme}
              />
            ))}
          </View>
        )}
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  results: { marginTop: 8 },
  jackTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
});