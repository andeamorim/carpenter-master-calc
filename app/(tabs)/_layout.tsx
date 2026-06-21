import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTabBarPadding } from '../../src/hooks/useTabBarPadding';
import { useTheme } from '../../src/hooks/useTheme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const r = useResponsive();
  const icons: Record<string, string> = {
    calc: '🔢',
    ez: '📋',
    projects: '📁',
    settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: r.isCompactWidth ? 18 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name]}
    </Text>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const r = useResponsive();
  const tabBarBottom = useTabBarPadding();

  return (
    <AppShell>
      <Tabs
        safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontSize: r.isCompactWidth ? 15 : 17 },
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: 6,
            paddingBottom: tabBarBottom,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarLabelStyle: {
            fontSize: r.isCompactWidth ? 9 : 10,
            marginTop: 0,
            marginBottom: 2,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ focused }) => <TabIcon name="calc" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="ez-calcs"
          options={{
            title: 'EZ Calcs',
            tabBarIcon: ({ focused }) => <TabIcon name="ez" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: 'Projects',
            tabBarIcon: ({ focused }) => <TabIcon name="projects" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          }}
        />
      </Tabs>
    </AppShell>
  );
}