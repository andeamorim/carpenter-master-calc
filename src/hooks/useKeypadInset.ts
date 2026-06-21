import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Bottom safe padding for calculator keypad (replaces tab bar inset). */
export function useKeypadInset(): number {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;

  if (isMobileWeb) {
    return Math.max(insets.bottom, 16);
  }
  return Math.max(insets.bottom, 8);
}