import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTabBarPadding } from '../../src/hooks/useTabBarPadding';
import { useTheme } from '../../src/hooks/useTheme';

const TAB_CONTENT_HEIGHT = 46;

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
    <View
      style={[
        styles.root,
        r.isDesktop && { backgroundColor: theme.surfaceElevated, alignItems: 'center' },
      ]}
    >
      <View style={[styles.shell, { maxWidth: r.appMaxWidth }]}>
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
              paddingTop: 4,
              paddingBottom: tabBarBottom,
              height: TAB_CONTENT_HEIGHT + 4 + tabBarBottom,
            },
            tabBarItemStyle: {
              paddingTop: 2,
              paddingBottom: 0,
            },
            tabBarLabelStyle: {
              fontSize: r.isCompactWidth ? 9 : 10,
              marginTop: 1,
              marginBottom: 0,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, width: '100%' },
});