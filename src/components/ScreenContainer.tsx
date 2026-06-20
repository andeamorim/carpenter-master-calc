import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: Edge[];
  centerContent?: boolean;
}

export function ScreenContainer({
  children,
  scroll = false,
  style,
  contentStyle,
  edges = ['bottom'],
  centerContent = false,
}: ScreenContainerProps) {
  const theme = useTheme();
  const r = useResponsive();

  const inner = (
    <View
      style={[
        styles.inner,
        {
          paddingHorizontal: r.padding,
          maxWidth: r.contentMaxWidth,
        },
        centerContent && styles.centered,
        !scroll && contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[
        styles.scrollContent,
        centerContent && styles.centered,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: r.padding,
            maxWidth: r.contentMaxWidth,
          },
          centerContent && styles.centered,
        ]}
      >
        {children}
      </View>
    </ScrollView>
  ) : (
    <View style={[styles.fill, style]}>{inner}</View>
  );

  return (
    <SafeAreaView
      style={[styles.fill, { backgroundColor: theme.background }]}
      edges={edges}
    >
      <View
        style={[
          styles.fill,
          r.isDesktop && { backgroundColor: theme.surfaceElevated, alignItems: 'center' },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: '100%',
              maxWidth: r.appMaxWidth,
            },
            r.isDesktop && styles.desktopShadow,
          ]}
        >
          {body}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  desktopShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
});