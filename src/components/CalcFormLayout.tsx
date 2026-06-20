import { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { ScreenContainer } from './ScreenContainer';
import { useResponsive } from '../hooks/useResponsive';

interface CalcFormLayoutProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
}

export function CalcFormLayout({ children, contentStyle }: CalcFormLayoutProps) {
  const r = useResponsive();

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: r.padding * 2 },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
});