import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { Theme } from '../theme/colors';

interface DimensionalInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  theme: Theme;
  placeholder?: string;
  hint?: string;
}

export function DimensionalInput({
  label,
  value,
  onChangeText,
  theme,
  placeholder = `e.g. 12' 6-1/2"`,
  hint,
}: DimensionalInputProps) {
  const r = useResponsive();

  return (
    <View style={[styles.container, { marginBottom: r.isCompactHeight ? 12 : 16 }]}>
      <Text style={[styles.label, { color: theme.text, fontSize: r.isCompactWidth ? 14 : 15 }]}>
        {label}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: theme.textSecondary, fontSize: r.hintFontSize }]}>
          {hint}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
            fontSize: r.isCompactWidth ? 16 : 18,
            padding: r.isCompactWidth ? 12 : 14,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { fontWeight: '600', marginBottom: 6 },
  hint: { marginBottom: 6, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: 10 },
});