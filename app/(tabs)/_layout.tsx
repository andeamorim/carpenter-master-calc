import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { AppShell } from '../../src/components/AppShell';
import { TabBarLabel } from '../../src/components/TabBarLabel';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTabBarPadding } from '../../src/hooks/useTabBarPadding';
import { useTheme } from '../../src/hooks/useTheme';

const TAB_ICON_AREA = 24;
const TAB_LABEL_AREA = 14;
const TAB_PADDING_TOP = 6;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const r = useResponsive();
  const icons: Record<string, string> = {
    calc: '🔢',
    ez: '📋',
    projects: '📁',
    settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: r.isCompactWidth ? 17 : 19, opacity: focused ? 1 : 0.5 }}>
      {icons[name]}
    </Text>
  );
}

type TabConfig = {
  name: string;
  title: string;
  shortTitle: string;
  icon: string;
};

const TABS: TabConfig[] = [
  { name: 'index', title: 'Calculator', shortTitle: 'Calc', icon: 'calc' },
  { name: 'ez-calcs', title: 'EZ Calcs', shortTitle: 'EZ', icon: 'ez' },
  { name: 'projects', title: 'Projects', shortTitle: 'Proj', icon: 'projects' },
  { name: 'settings', title: 'Settings', shortTitle: 'Set', icon: 'settings' },
];

export default function TabLayout() {
  const theme = useTheme();
  const r = useResponsive();
  const tabBarBottom = useTabBarPadding();
  const tabBarHeight =
    TAB_PADDING_TOP + TAB_ICON_AREA + TAB_LABEL_AREA + tabBarBottom;

  return (
    <AppShell>
      <Tabs
        safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontSize: r.isCompactWidth ? 15 : 17 },
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: TAB_PADDING_TOP,
            paddingBottom: tabBarBottom,
            height: tabBarHeight,
            minHeight: tabBarHeight,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
            flex: 1,
          },
          tabBarIconStyle: {
            marginBottom: 0,
            height: TAB_ICON_AREA,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => <TabIcon name={tab.icon} focused={focused} />,
              tabBarLabel: ({ focused, color }) => (
                <TabBarLabel
                  label={tab.title}
                  shortLabel={tab.shortTitle}
                  color={color}
                  focused={focused}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </AppShell>
  );
}