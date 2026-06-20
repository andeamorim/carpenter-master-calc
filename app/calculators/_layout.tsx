import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/hooks/useTheme';

export default function CalculatorsLayout() {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.background },
        r.isDesktop && { backgroundColor: theme.surfaceElevated, alignItems: 'center' },
      ]}
    >
      <View style={{ flex: 1, width: '100%', maxWidth: r.appMaxWidth }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.text,
            headerTitleStyle: { fontSize: r.isCompactWidth ? 15 : 17 },
            contentStyle: { backgroundColor: theme.background },
          }}
        />
      </View>
    </View>
  );
}