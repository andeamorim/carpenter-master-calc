import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';
import type { InputUnit } from '../types';

interface DisplayProps {
  value: string;
  subValue?: string;
  hint?: string;
  unit: InputUnit;
  theme: Theme;
  onToggleUnit: () => void;
}

export function Display({ value, subValue, hint, unit, theme, onToggleUnit }: DisplayProps) {
  const r = useResponsive();
  const unitFontSize = Math.round(r.hintFontSize * 1.15);
  const showHint =
    hint &&
    !hint.includes('tap unit above');

  return (
    <View style={[styles.container, { minHeight: r.displayMinHeight }]}>
      <Pressable
        onPress={onToggleUnit}
        accessibilityRole="button"
        accessibilityLabel={`Unit: ${unit}. Tap to switch.`}
        style={({ pressed }) => [
          styles.unitToggle,
          { borderColor: theme.border, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <View style={[styles.unitWindow, unit === 'inches' && { backgroundColor: theme.primary }]}>
          <Text
            style={[
              styles.unitText,
              {
                color: unit === 'inches' ? '#fff' : theme.textSecondary,
                fontSize: unitFontSize,
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
                fontSize: unitFontSize,
              },
            ]}
          >
            FEET
          </Text>
        </View>
      </Pressable>

      <View style={styles.body}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 8,
    paddingBottom: 4,
    paddingTop: 4,
  },
  unitToggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 1,
  },
  unitWindow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitText: {
    fontWeight: '700',
    letterSpacing: 1.4,
    fontFamily: 'Menlo',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 44,
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