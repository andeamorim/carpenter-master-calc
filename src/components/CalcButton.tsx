import { Pressable, StyleSheet, Text } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';

type ButtonVariant =
  | 'number'
  | 'operator'
  | 'function'
  | 'construction'
  | 'memory'
  | 'equals';

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  theme: Theme;
  wide?: boolean;
  double?: boolean;
  small?: boolean;
  fraction?: boolean;
  fullWidth?: boolean;
  flex?: number;
  disabled?: boolean;
}

export function CalcButton({
  label,
  onPress,
  variant = 'number',
  theme,
  wide = false,
  double = false,
  small = false,
  fraction = false,
  fullWidth = false,
  flex,
  disabled = false,
}: CalcButtonProps) {
  const r = useResponsive();

  const bgColor = {
    number: theme.keyNumber,
    operator: theme.keyOperator,
    function: theme.keyFunction,
    construction: theme.keyConstruction,
    memory: theme.keyMemory,
    equals: theme.keyEquals,
  }[variant];

  const textColor =
    variant === 'function'
      ? '#000000'
      : variant === 'operator' ||
          variant === 'construction' ||
          variant === 'memory' ||
          variant === 'equals'
        ? theme.textOnPrimary
        : theme.text;

  const minHeight = fullWidth
    ? r.buttonHeightEquals
    : double
      ? r.buttonHeight * 2
      : fraction
        ? r.fractionButtonHeight
        : small
          ? r.buttonHeightSmall
          : r.buttonHeight;

  const fontSize = fullWidth
    ? r.buttonFontSizeEquals
    : fraction
      ? r.fractionButtonFontSize
      : small
        ? r.buttonFontSizeSmall
        : label.length > 3 || label.includes('↔')
          ? r.buttonFontSizeSmall
          : r.buttonFontSize;

  const flexValue = flex ?? (fullWidth ? undefined : wide ? 2 : 1);
  const isFixedWidth = flex === 0;
  const isRound = !fullWidth && !small && !fraction && !double;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isRound && styles.round,
        fullWidth && styles.equals,
        {
          backgroundColor: bgColor,
          opacity: pressed ? 0.65 : disabled ? 0.4 : 1,
          flex: isFixedWidth ? undefined : flexValue,
          flexGrow: isFixedWidth ? 0 : undefined,
          flexShrink: isFixedWidth ? 0 : undefined,
          minWidth: isFixedWidth
            ? fraction
              ? r.fractionButtonMinWidth
              : small
                ? r.fractionButtonMinWidth - 6
                : r.fractionButtonMinWidth
            : undefined,
          paddingHorizontal: fraction ? 10 : 2,
          width: fullWidth ? '100%' : undefined,
          minHeight,
          margin: r.buttonGap,
          borderRadius: fullWidth ? 14 : double ? 16 : fraction ? 12 : isRound ? minHeight / 2 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontSize: double ? fontSize * 1.35 : fontSize,
            fontWeight: variant === 'equals' ? '400' : variant === 'number' ? '400' : '500',
            opacity: disabled ? 0.45 : 1,
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  round: {},
  equals: {
    marginTop: 2,
  },
  label: {
    textAlign: 'center',
  },
});