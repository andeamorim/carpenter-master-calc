import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { formatDimensional, parseDimensionalInput } from '../../src/engine/dimensional';
import { calculateStairs } from '../../src/engine/stairs';
import { useTheme } from '../../src/hooks/useTheme';
import type { DimensionalValue } from '../../src/types';
import { useSettingsStore } from '../../src/store/settings';

export default function StairsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const settings = useSettingsStore();
  const { fractionResolution, displayMode } = settings;
  const [totalRise, setTotalRise] = useState('');
  const [riserHeight, setRiserHeight] = useState(`7-1/2"`);
  const [treadWidth, setTreadWidth] = useState(`10"`);
  const [headroom, setHeadroom] = useState(`6' 8"`);
  const [riserLimited, setRiserLimited] = useState(true);

  const fmt = (v: DimensionalValue) =>
    formatDimensional(v, fractionResolution, displayMode);

  const result = useMemo(() => {
    const rise = parseDimensionalInput(totalRise);
    if (!rise) return null;
    return calculateStairs({
      totalRise: rise,
      desiredRiserHeight: parseDimensionalInput(riserHeight) ?? settings.defaultRiserHeight,
      desiredTreadWidth: parseDimensionalInput(treadWidth) ?? settings.defaultTreadWidth,
      headroomRequired: parseDimensionalInput(headroom) ?? settings.defaultHeadroom,
      floorThickness: settings.defaultFloorThickness,
      riserLimited,
      maxRiserHeight: settings.defaultRiserHeight,
    });
  }, [totalRise, riserHeight, treadWidth, headroom, riserLimited, fractionResolution, displayMode]);

  return (
    <>
      <Stack.Screen options={{ title: 'Stair Calculator' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Total Rise (floor to floor)" value={totalRise} onChangeText={setTotalRise} theme={theme} />
        <DimensionalInput label="Desired Riser Height" value={riserHeight} onChangeText={setRiserHeight} theme={theme} />
        <DimensionalInput label="Tread Width" value={treadWidth} onChangeText={setTreadWidth} theme={theme} />
        <DimensionalInput label="Headroom Required" value={headroom} onChangeText={setHeadroom} theme={theme} />
        <View style={styles.switchRow}>
          <Text
            style={[
              styles.switchLabel,
              { color: theme.text, fontSize: r.isCompactWidth ? 14 : 15 },
            ]}
          >
            Riser Limited (code compliance)
          </Text>
          <Switch value={riserLimited} onValueChange={setRiserLimited} trackColor={{ true: theme.primary }} />
        </View>

        {result && (
          <View style={styles.results}>
            <ResultRow label="# Risers" value={String(result.numberOfRisers)} theme={theme} />
            <ResultRow label="Actual Riser Height" value={fmt(result.actualRiserHeight)} theme={theme} highlight />
            <ResultRow label="Riser Over/Under" value={fmt(result.riserOverUnder)} theme={theme} />
            <ResultRow label="# Treads" value={String(result.numberOfTreads)} theme={theme} />
            <ResultRow label="Total Run" value={fmt(result.totalRun)} theme={theme} />
            <ResultRow label="Stringer Length" value={fmt(result.stringerLength)} theme={theme} highlight />
            <ResultRow label="Incline Angle" value={`${result.inclineAngle}°`} theme={theme} />
            <ResultRow
              label="Headroom Check"
              value={result.headroomOk ? '✓ OK' : '✗ Too low'}
              theme={theme}
              highlight
            />
          </View>
        )}
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  switchLabel: { flex: 1 },
  results: { marginTop: 8 },
});