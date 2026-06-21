import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabBarPadding(): number {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;

  if (isMobileWeb) {
    return Math.max(insets.bottom, 20);
  }
  if (Platform.OS === 'web') {
    return Math.max(insets.bottom, 10);
  }
  return Math.max(insets.bottom, 10);
}