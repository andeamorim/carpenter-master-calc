import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { formatDimensional, parseDimensionalInput } from '../../src/engine/dimensional';
import { solveRightAngle } from '../../src/engine/right-angle';
import { useTheme } from '../../src/hooks/useTheme';
import type { DimensionalValue } from '../../src/types';
import { useSettingsStore } from '../../src/store/settings';

export default function RightAngleScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const { fractionResolution, displayMode } = useSettingsStore();
  const [rise, setRise] = useState('');
  const [run, setRun] = useState('');
  const [diag, setDiag] = useState('');
  const [pitch, setPitch] = useState('7/12');

  const fmt = (v: DimensionalValue) =>
    formatDimensional(v, fractionResolution, displayMode);

  const result = useMemo(() => {
    const pitchParts = pitch.split('/');
    const pitchRatio =
      pitchParts.length === 2
        ? { rise: parseFloat(pitchParts[0]), run: parseFloat(pitchParts[1]) || 12 }
        : undefined;

    return solveRightAngle({
      rise: rise ? parseDimensionalInput(rise) ?? undefined : undefined,
      run: run ? parseDimensionalInput(run) ?? undefined : undefined,
      diagonal: diag ? parseDimensionalInput(diag) ?? undefined : undefined,
      pitchRatio,
    });
  }, [rise, run, diag, pitch, fractionResolution, displayMode]);

  return (
    <>
      <Stack.Screen options={{ title: 'Right Angle / Rafter' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Enter any 2 values + pitch to solve the right triangle. Core tool for rafters.
        </Text>

        <DimensionalInput label="Pitch (rise/run)" value={pitch} onChangeText={setPitch} theme={theme} placeholder="7/12" hint="e.g. 7/12, or leave blank if using rise+run" />
        <DimensionalInput label="Rise" value={rise} onChangeText={setRise} theme={theme} />
        <DimensionalInput label="Run" value={run} onChangeText={setRun} theme={theme} />
        <DimensionalInput label="Diagonal" value={diag} onChangeText={setDiag} theme={theme} />

        {result && (
          <View style={styles.results}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>Results</Text>
            <ResultRow label="Rise" value={fmt(result.rise)} theme={theme} />
            <ResultRow label="Run" value={fmt(result.run)} theme={theme} />
            <ResultRow label="Diagonal" value={fmt(result.diagonal)} theme={theme} highlight />
            <ResultRow label="Pitch" value={result.pitchRatio} theme={theme} />
            <ResultRow label="Pitch (degrees)" value={`${result.pitchDegrees}°`} theme={theme} />
            <ResultRow label="Pitch (%)" value={`${result.pitchPercent}%`} theme={theme} />
            <ResultRow label="Plumb Cut Angle" value={`${result.plumbCutAngle.toFixed(2)}°`} theme={theme} />
            <ResultRow label="Level Cut Angle" value={`${result.levelCutAngle.toFixed(2)}°`} theme={theme} />
          </View>
        )}

        <Pressable
          onPress={() => { setRise(''); setRun(''); setDiag(''); setPitch('7/12'); }}
          style={[styles.clearBtn, { borderColor: theme.border }]}
        >
          <Text style={{ color: theme.textSecondary }}>Clear All</Text>
        </Pressable>
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  results: { marginTop: 8 },
  resultsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  clearBtn: { alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 10, marginTop: 8 },
});