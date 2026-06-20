import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';

interface DisplayProps {
  value: string;
  subValue?: string;
  hint?: string;
  theme: Theme;
  tapeVisible?: boolean;
  tapeEntries?: { expression: string; result: string }[];
}

export function Display({ value, subValue, hint, theme, tapeVisible, tapeEntries }: DisplayProps) {
  const r = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.displayBg,
          minHeight: r.displayMinHeight,
          padding: r.isCompactHeight ? 12 : 16,
          borderRadius: r.isCompactWidth ? 10 : 12,
        },
      ]}
    >
      {tapeVisible && tapeEntries && tapeEntries.length > 0 && (
        <ScrollView
          style={[styles.tape, { maxHeight: r.isCompactHeight ? 36 : 50 }]}
          nestedScrollEnabled
        >
          {tapeEntries.slice(0, 5).map((entry, i) => (
            <Text
              key={i}
              style={[styles.tapeLine, { color: theme.textSecondary, fontSize: r.hintFontSize - 1 }]}
            >
              {entry.expression} = {entry.result}
            </Text>
          ))}
        </ScrollView>
      )}
      {subValue ? (
        <Text
          style={[
            styles.subDisplay,
            { color: theme.textSecondary, fontSize: r.subDisplayFontSize },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {subValue}
        </Text>
      ) : null}
      <Text
        style={[styles.mainDisplay, { color: theme.displayText, fontSize: r.displayFontSize }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.45}
      >
        {value}
      </Text>
      {hint ? (
        <Text
          style={[styles.hint, { color: theme.accent, fontSize: r.hintFontSize }]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  tape: {
    marginBottom: 4,
  },
  tapeLine: {
    fontFamily: 'Menlo',
    marginBottom: 2,
  },
  subDisplay: {
    textAlign: 'right',
    marginBottom: 4,
    fontFamily: 'Menlo',
  },
  mainDisplay: {
    fontWeight: '700',
    textAlign: 'right',
    fontFamily: 'Menlo',
  },
  hint: {
    textAlign: 'right',
    marginTop: 6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});