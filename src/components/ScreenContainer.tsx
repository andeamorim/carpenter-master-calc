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
  edges = ['top'],
  centerContent = false,
}: ScreenContainerProps) {
  const theme = useTheme();
  const r = useResponsive();

  const inner = (
    <View
      style={[
        styles.inner,
        { paddingHorizontal: r.padding, maxWidth: r.contentMaxWidth },
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
          { paddingHorizontal: r.padding, maxWidth: r.contentMaxWidth },
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
      {body}
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
});