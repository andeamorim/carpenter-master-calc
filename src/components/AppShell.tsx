import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';

interface AppShellProps {
  children: ReactNode;
  style?: ViewStyle;
}

/** Full-bleed background; optional centered column on desktop only. */
export function AppShell({ children, style }: AppShellProps) {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }, style]}>
      <View
        style={[
          styles.inner,
          r.isDesktop && {
            maxWidth: r.appMaxWidth,
            alignSelf: 'center',
            backgroundColor: theme.background,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});