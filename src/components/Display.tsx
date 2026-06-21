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
  const showHint = hint && hint !== 'Tap numbers · use " for inches · fraction keys for 7/8, 15/16…';

  return (
    <View style={[styles.container, { minHeight: r.displayMinHeight }]}>
      {tapeVisible && tapeEntries && tapeEntries.length > 0 && (
        <ScrollView
          style={[styles.tape, { maxHeight: r.isCompactHeight ? 40 : 56 }]}
          nestedScrollEnabled
        >
          {tapeEntries.slice(0, 5).map((entry, i) => (
            <Text
              key={i}
              style={[styles.tapeLine, { color: theme.textSecondary, fontSize: r.hintFontSize }]}
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
        minimumFontScale={0.4}
      >
        {value}
      </Text>

      {showHint ? (
        <Text
          style={[styles.hint, { color: theme.accent, fontSize: r.hintFontSize - 1 }]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  tape: { marginBottom: 6 },
  tapeLine: {
    textAlign: 'right',
    fontFamily: 'Menlo',
    marginBottom: 2,
  },
  subDisplay: {
    textAlign: 'right',
    marginBottom: 6,
    fontWeight: '400',
  },
  mainDisplay: {
    fontWeight: '300',
    textAlign: 'right',
    letterSpacing: -1,
  },
  hint: {
    textAlign: 'right',
    marginTop: 8,
    lineHeight: 16,
  },
});