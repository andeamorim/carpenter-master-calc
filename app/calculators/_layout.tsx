import { Stack } from 'expo-router';
import { AppShell } from '../../src/components/AppShell';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/hooks/useTheme';

export default function CalculatorsLayout() {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <AppShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontSize: r.isCompactWidth ? 15 : 17 },
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </AppShell>
  );
}