import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenSize = 'compact' | 'phone' | 'tablet' | 'desktop';

export interface ResponsiveMetrics {
  width: number;
  height: number;
  isWeb: boolean;
  isNarrow: boolean;
  isCompactWidth: boolean;
  isCompactHeight: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  size: ScreenSize;
  scale: number;
  contentMaxWidth: number | undefined;
  appMaxWidth: number | undefined;
  padding: number;
  buttonHeight: number;
  buttonHeightSmall: number;
  buttonHeightEquals: number;
  buttonGap: number;
  buttonFontSize: number;
  buttonFontSizeSmall: number;
  buttonFontSizeEquals: number;
  displayMinHeight: number;
  displayFontSize: number;
  hintFontSize: number;
  subDisplayFontSize: number;
  sectionTitleFontSize: number;
  needsScroll: boolean;
  fractionButtonMinWidth: number;
  tabBarHeight: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useResponsive(): ResponsiveMetrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const isWeb = Platform.OS === 'web';
    const isNarrow = width < 340;
    const isCompactWidth = width < 380;
    const isCompactHeight = height < 700;
    const isTablet = width >= 768;
    const isDesktop = width >= 1024 || (isWeb && width >= 900);

    let size: ScreenSize = 'phone';
    if (isDesktop) size = 'desktop';
    else if (isTablet) size = 'tablet';
    else if (isNarrow || isCompactWidth || isCompactHeight) size = 'compact';

    const scale = clamp(
      isNarrow
        ? 0.72
        : isCompactHeight
          ? 0.78
          : isCompactWidth
            ? 0.86
            : isDesktop
              ? 1.08
              : isTablet
                ? 1.02
                : 1,
      0.68,
      1.12,
    );

    const desktopMax = 480;
    const appMaxWidth = isDesktop ? desktopMax : undefined;
    const contentMaxWidth = isDesktop ? desktopMax : undefined;
    const padding = isNarrow ? 6 : isCompactWidth ? 8 : isDesktop ? 20 : 12;

    const buttonHeight = Math.round(clamp(52 * scale, 36, 58));
    const buttonHeightSmall = Math.round(clamp(42 * scale, 30, 48));
    const buttonHeightEquals = Math.round(clamp(58 * scale, 42, 68));

    const tabBarBottom = isWeb
      ? width < 768
        ? 20
        : 10
      : Math.max(insets.bottom, 10);
    const tabBarHeight = 6 + 24 + 14 + tabBarBottom;

    const usableHeight = height - insets.top - tabBarHeight - 48;

    return {
      width,
      height,
      isWeb,
      isNarrow,
      isCompactWidth,
      isCompactHeight,
      isTablet,
      isDesktop,
      size,
      scale,
      contentMaxWidth,
      appMaxWidth,
      padding,
      buttonHeight,
      buttonHeightSmall,
      buttonHeightEquals,
      buttonGap: isNarrow ? 1 : isCompactWidth ? 2 : 3,
      buttonFontSize: Math.round(clamp(16 * scale, 13, 18)),
      buttonFontSizeSmall: Math.round(clamp(11 * scale, 9, 13)),
      buttonFontSizeEquals: Math.round(clamp(28 * scale, 20, 32)),
      displayMinHeight: Math.round(
        clamp(
          isCompactHeight ? 72 * scale : 130 * scale,
          isCompactHeight ? 64 : 88,
          150,
        ),
      ),
      displayFontSize: Math.round(clamp(38 * scale, 22, 44)),
      hintFontSize: Math.round(clamp(12 * scale, 10, 14)),
      subDisplayFontSize: Math.round(clamp(14 * scale, 11, 16)),
      sectionTitleFontSize: Math.round(clamp(18 * scale, 15, 20)),
      needsScroll: usableHeight < 560 || isCompactHeight,
      fractionButtonMinWidth: Math.round(clamp(44 * scale, 34, 52)),
      tabBarHeight,
    };
  }, [width, height, insets.top, insets.bottom]);
}