import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';
import type { InputUnit } from '../types';

interface DisplayProps {
  value: string;
  subValue?: string;
  hint?: string;
  unit: InputUnit;
  theme: Theme;
}

export function Display({ value, subValue, hint, unit, theme }: DisplayProps) {
  const r = useResponsive();
  const showHint =
    hint &&
    hint !== 'Inches mode · tap ft↔in to switch' &&
    hint !== 'Feet mode · tap ft↔in to switch';

  return (
    <View style={[styles.container, { minHeight: r.displayMinHeight }]}>
      <View style={[styles.unitStrip, { borderColor: theme.border }]}>
        <View style={[styles.unitWindow, unit === 'inches' && { backgroundColor: theme.primary }]}>
          <Text
            style={[
              styles.unitText,
              {
                color: unit === 'inches' ? '#fff' : theme.textSecondary,
                fontSize: r.hintFontSize,
              },
            ]}
          >
            INCH
          </Text>
        </View>
        <View style={[styles.unitWindow, unit === 'feet' && { backgroundColor: theme.primary }]}>
          <Text
            style={[
              styles.unitText,
              {
                color: unit === 'feet' ? '#fff' : theme.textSecondary,
                fontSize: r.hintFontSize,
              },
            ]}
          >
            FEET
          </Text>
        </View>
      </View>

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
  unitStrip: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  unitWindow: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 52,
    alignItems: 'center',
  },
  unitText: {
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'Menlo',
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