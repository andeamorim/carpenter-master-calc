import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';

interface ResultRowProps {
  label: string;
  value: string;
  theme: Theme;
  highlight?: boolean;
}

export function ResultRow({ label, value, theme, highlight }: ResultRowProps) {
  const r = useResponsive();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: highlight ? theme.surfaceElevated : theme.surface,
          borderColor: theme.border,
          padding: r.isCompactWidth ? 10 : 14,
        },
      ]}
    >
      <Text
        style={[styles.label, { color: theme.textSecondary, fontSize: r.hintFontSize }]}
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          {
            color: theme.text,
            fontSize: r.isCompactWidth ? 14 : 16,
          },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  label: {
    flex: 1,
  },
  value: {
    fontWeight: '700',
    fontFamily: 'Menlo',
    textAlign: 'right',
    flex: 1,
  },
});