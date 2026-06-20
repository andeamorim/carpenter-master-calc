import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { formatDimensional, parseDimensionalInput } from '../../src/engine/dimensional';
import { calculateStuds } from '../../src/engine/framing';
import { useTheme } from '../../src/hooks/useTheme';
import type { DimensionalValue } from '../../src/types';
import { useSettingsStore } from '../../src/store/settings';

export default function StudsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const settings = useSettingsStore();
  const { fractionResolution, displayMode } = useSettingsStore();
  const [wallLength, setWallLength] = useState('');
  const [spacing, setSpacing] = useState<16 | 24>(settings.defaultStudSpacing);

  const fmt = (v: DimensionalValue) =>
    formatDimensional(v, fractionResolution, displayMode);

  const result = useMemo(() => {
    const length = parseDimensionalInput(wallLength);
    if (!length) return null;
    return calculateStuds(length, spacing);
  }, [wallLength, spacing, fractionResolution, displayMode]);

  return (
    <>
      <Stack.Screen options={{ title: 'Stud Wall' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Wall Length" value={wallLength} onChangeText={setWallLength} theme={theme} />
        <Text style={[styles.label, { color: theme.text }]}>On-Center Spacing</Text>
        <View style={styles.chipRow}>
          {([16, 24] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSpacing(s)}
              style={[
                styles.chip,
                {
                  backgroundColor: spacing === s ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: spacing === s ? '#fff' : theme.text, fontWeight: '700' }}>
                {s}&quot; o.c.
              </Text>
            </Pressable>
          ))}
        </View>

        {result && (
          <View style={styles.results}>
            <ResultRow label="Stud Count" value={String(result.studCount)} theme={theme} highlight />
            <ResultRow label="Wall Length" value={fmt(result.wallLength)} theme={theme} />
            <ResultRow label="Spacing" value={`${result.spacing}" o.c.`} theme={theme} />
            <ResultRow label="Plate Lumber (3x length)" value={fmt(result.plateLinearFeet)} theme={theme} />
          </View>
        )}
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  results: { marginTop: 8 },
});