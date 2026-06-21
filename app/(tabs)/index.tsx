import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalcButton } from '../../src/components/CalcButton';
import { Display } from '../../src/components/Display';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/hooks/useTheme';
import { QUICK_FRACTIONS, useCalculatorStore } from '../../src/store/calculator';
import { useSettingsStore } from '../../src/store/settings';
import { useTapeStore } from '../../src/store/tape';

type BtnVariant = 'number' | 'operator' | 'function' | 'construction' | 'memory';

export default function CalculatorScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const calc = useCalculatorStore();
  const fractionResolution = useSettingsStore((s) => s.fractionResolution);
  const displayMode = useSettingsStore((s) => s.displayMode);
  const tape = useTapeStore();
  const [showTape, setShowTape] = useState(false);

  useEffect(() => {
    calc.refreshDisplayFormat();
  }, [fractionResolution, displayMode]);

  const rows: {
    label: string;
    variant: BtnVariant;
    action: () => void;
    wide?: boolean;
    small?: boolean;
  }[][] = [
    [
      { label: 'MC', variant: 'memory', action: calc.memoryClear, small: true },
      { label: 'MR', variant: 'memory', action: calc.memoryRecall, small: true },
      { label: 'M+', variant: 'memory', action: calc.memoryAdd, small: true },
      { label: 'M−', variant: 'memory', action: calc.memorySubtract, small: true },
      { label: 'Tape', variant: 'function', action: () => setShowTape(!showTape), small: true },
    ],
    [
      { label: 'C', variant: 'function', action: calc.pressClear },
      { label: 'CE', variant: 'function', action: calc.pressClearEntry },
      { label: '⌫', variant: 'function', action: calc.pressBackspace },
      { label: '±', variant: 'function', action: calc.pressSign },
      { label: '÷', variant: 'operator', action: () => calc.pressOperator('÷') },
    ],
    [
      { label: '7', variant: 'number', action: () => calc.pressDigit(7) },
      { label: '8', variant: 'number', action: () => calc.pressDigit(8) },
      { label: '9', variant: 'number', action: () => calc.pressDigit(9) },
      { label: '×', variant: 'operator', action: () => calc.pressOperator('×') },
    ],
    [
      { label: '4', variant: 'number', action: () => calc.pressDigit(4) },
      { label: '5', variant: 'number', action: () => calc.pressDigit(5) },
      { label: '6', variant: 'number', action: () => calc.pressDigit(6) },
      { label: '−', variant: 'operator', action: () => calc.pressOperator('-') },
    ],
    [
      { label: '1', variant: 'number', action: () => calc.pressDigit(1) },
      { label: '2', variant: 'number', action: () => calc.pressDigit(2) },
      { label: '3', variant: 'number', action: () => calc.pressDigit(3) },
      { label: '+', variant: 'operator', action: () => calc.pressOperator('+') },
    ],
    [
      { label: '0', variant: 'number', action: () => calc.pressDigit(0), wide: true },
      { label: '′', variant: 'construction', action: calc.pressFeet },
      { label: '″', variant: 'construction', action: calc.pressInches },
      { label: 'a⁄c', variant: 'construction', action: calc.pressFraction },
    ],
  ];

  const content = (
    <View style={styles.main}>
      <View style={[styles.displayArea, r.isCompactHeight && styles.displayAreaCompact]}>
        <Display
          value={calc.display}
          subValue={calc.subDisplay}
          hint={calc.inputHint}
          theme={theme}
          tapeVisible={showTape}
          tapeEntries={tape.entries}
        />
      </View>

      {!r.isCompactHeight && (
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontSize: r.hintFontSize - 1 }]}>
          Quick fractions
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.fractionScroll}
        contentContainerStyle={[styles.fractionRow, { gap: r.buttonGap }]}
      >
        {QUICK_FRACTIONS.map((f) => (
          <CalcButton
            key={f.label}
            label={f.label}
            variant="construction"
            theme={theme}
            small
            flex={0}
            onPress={() => calc.pressQuickFraction(f.num, f.den)}
          />
        ))}
      </ScrollView>

      <View style={styles.keypad}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn) => (
              <CalcButton
                key={btn.label}
                label={btn.label}
                variant={btn.variant}
                theme={theme}
                wide={btn.wide}
                small={btn.small}
                onPress={btn.action}
              />
            ))}
          </View>
        ))}
        <CalcButton
          label="="
          variant="equals"
          theme={theme}
          fullWidth
          onPress={calc.pressEquals}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer scroll={r.needsScroll} style={styles.screen}>
      {content}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 0,
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 0,
  },
  displayArea: {
    flexShrink: 1,
    minHeight: 0,
  },
  displayAreaCompact: {
    flexGrow: 0,
    flexShrink: 1,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fractionScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  fractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  keypad: {
    flexShrink: 0,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
});