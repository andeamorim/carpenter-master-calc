import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bottom padding inside the tab bar.
 * Web mobile safe area is handled via CSS padding on #root (+html.tsx).
 */
export function useTabBarPadding(): number {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;

  if (isMobileWeb) {
    return 4;
  }
  if (Platform.OS === 'web') {
    return 8;
  }
  return Math.max(insets.bottom, 8);
}