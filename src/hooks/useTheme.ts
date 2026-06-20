import { darkTheme, lightTheme } from '../theme/colors';
import { useSettingsStore } from '../store/settings';

export function useTheme() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return darkMode ? darkTheme : lightTheme;
}