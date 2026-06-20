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
  small?: boolean;
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
  small = false,
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
    variant === 'operator' ||
    variant === 'construction' ||
    variant === 'memory' ||
    variant === 'equals'
      ? theme.textOnPrimary
      : theme.text;

  const minHeight = fullWidth
    ? r.buttonHeightEquals
    : small
      ? r.buttonHeightSmall
      : r.buttonHeight;

  const fontSize = fullWidth
    ? r.buttonFontSizeEquals
    : small
      ? r.buttonFontSizeSmall
      : label.length > 3
        ? r.buttonFontSizeSmall
        : r.buttonFontSize;

  const flexValue = flex ?? (fullWidth ? undefined : wide ? 2 : 1);
  const isFixedWidth = flex === 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: variant === 'equals' ? theme.keyEquals : theme.border,
          opacity: pressed ? 0.75 : disabled ? 0.4 : 1,
          flex: isFixedWidth ? undefined : flexValue,
          flexGrow: isFixedWidth ? 0 : undefined,
          flexShrink: isFixedWidth ? 0 : undefined,
          minWidth: isFixedWidth
            ? small
              ? r.fractionButtonMinWidth - 4
              : r.fractionButtonMinWidth
            : undefined,
          width: fullWidth ? '100%' : undefined,
          minHeight,
          margin: r.buttonGap,
          borderWidth: variant === 'equals' ? 2 : 1,
          borderRadius: r.isCompactWidth ? 6 : 8,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontSize }]} numberOfLines={2}>
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
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});