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
        ? 0.74
        : isCompactHeight
          ? 0.8
          : isCompactWidth
            ? 0.88
            : isDesktop
              ? 1.05
              : 1,
      0.7,
      1.1,
    );

    const desktopMax = 430;
    const appMaxWidth = isDesktop ? desktopMax : undefined;
    const contentMaxWidth = isDesktop ? desktopMax : undefined;
    const padding = isNarrow ? 6 : isCompactWidth ? 8 : isDesktop ? 16 : 10;

    const buttonHeight = Math.round(clamp(54 * scale, 40, 58));
    const buttonHeightSmall = Math.round(clamp(40 * scale, 32, 46));
    const buttonHeightEquals = Math.round(clamp(56 * scale, 44, 64));

    const keypadInset = isWeb
      ? width < 768
        ? 16
        : 8
      : Math.max(insets.bottom, 8);
    const headerHeight = insets.top + 52;
    const usableHeight = height - headerHeight - keypadInset - 280;

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
      buttonGap: isNarrow ? 3 : 4,
      buttonFontSize: Math.round(clamp(24 * scale, 20, 28)),
      buttonFontSizeSmall: Math.round(clamp(12 * scale, 10, 14)),
      buttonFontSizeEquals: Math.round(clamp(32 * scale, 26, 36)),
      displayMinHeight: Math.round(clamp(100 * scale, 72, 140)),
      displayFontSize: Math.round(clamp(64 * scale, 40, 72)),
      hintFontSize: Math.round(clamp(12 * scale, 10, 14)),
      subDisplayFontSize: Math.round(clamp(20 * scale, 16, 24)),
      sectionTitleFontSize: Math.round(clamp(18 * scale, 15, 20)),
      needsScroll: usableHeight < 0,
      fractionButtonMinWidth: Math.round(clamp(44 * scale, 36, 52)),
    };
  }, [width, height, insets.top, insets.bottom]);
}