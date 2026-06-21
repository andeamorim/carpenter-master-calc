import { ColorValue, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

interface TabBarLabelProps {
  label: string;
  shortLabel: string;
  color: ColorValue;
  focused: boolean;
}

export function TabBarLabel({ label, shortLabel, color, focused }: TabBarLabelProps) {
  const r = useResponsive();
  const text = r.isCompactWidth || r.width < 420 ? shortLabel : label;

  return (
    <Text
      style={[
        styles.label,
        {
          color,
          fontSize: r.isCompactWidth ? 10 : 11,
          fontWeight: focused ? '700' : '500',
        },
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
});