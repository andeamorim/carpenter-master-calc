import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalcFormLayout } from '../../src/components/CalcFormLayout';
import { useResponsive } from '../../src/hooks/useResponsive';
import { DimensionalInput } from '../../src/components/DimensionalInput';
import { ResultRow } from '../../src/components/ResultRow';
import { useTheme } from '../../src/hooks/useTheme';

export default function CompoundMiterScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const [springAngle, setSpringAngle] = useState('38');
  const [wallAngle, setWallAngle] = useState('90');

  const result = useMemo(() => {
    const spring = (parseFloat(springAngle) * Math.PI) / 180;
    const wall = (parseFloat(wallAngle) * Math.PI) / 180;
    if (!spring || !wall) return null;

    const miterAngle =
      Math.atan(
        Math.sin(wall / 2) /
          (Math.tan(spring) + Math.cos(wall / 2)),
      ) *
      (180 / Math.PI);

    const bevelAngle =
      Math.asin(Math.cos(wall / 2) * Math.sin(spring)) * (180 / Math.PI);

    return {
      miter: Math.round(miterAngle * 100) / 100,
      bevel: Math.round(bevelAngle * 100) / 100,
    };
  }, [springAngle, wallAngle]);

  return (
    <>
      <Stack.Screen options={{ title: 'Compound Miter' }} />
      <CalcFormLayout contentStyle={{ padding: r.padding }}>
        <DimensionalInput label="Spring Angle (°)" value={springAngle} onChangeText={setSpringAngle} theme={theme} placeholder="38" />
        <DimensionalInput label="Wall Corner Angle (°)" value={wallAngle} onChangeText={setWallAngle} theme={theme} placeholder="90" />
        {result && (
          <View style={styles.results}>
            <ResultRow label="Miter Angle" value={`${result.miter}°`} theme={theme} highlight />
            <ResultRow label="Bevel Angle" value={`${result.bevel}°`} theme={theme} highlight />
          </View>
        )}
      </CalcFormLayout>
    </>
  );
}

const styles = StyleSheet.create({
  results: { marginTop: 8 },
});