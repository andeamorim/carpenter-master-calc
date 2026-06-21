import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CalcButton } from '../src/components/CalcButton';
import { Display } from '../src/components/Display';
import { PageChrome } from '../src/components/PageChrome';
import { useKeypadInset } from '../src/hooks/useKeypadInset';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/hooks/useTheme';
import { QUICK_FRACTIONS, useCalculatorStore } from '../src/store/calculator';
import { useSettingsStore } from '../src/store/settings';

type BtnVariant = 'number' | 'operator' | 'function' | 'construction';

export default function CalculatorScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const keypadInset = useKeypadInset();
  const calc = useCalculatorStore();
  const inputUnit = useCalculatorStore((s) => s.inputUnit);
  const feetInchDecimal = useCalculatorStore((s) => s.feetInchDecimal);
  const fractionResolution = useSettingsStore((s) => s.fractionResolution);
  const displayMode = useSettingsStore((s) => s.displayMode);
  const defaultInputUnit = useSettingsStore((s) => s.defaultInputUnit);

  const decimalDisabled = inputUnit === 'inches';
  const fractionsDisabled = inputUnit === 'feet' && !feetInchDecimal;

  useEffect(() => {
    calc.refreshDisplayFormat();
  }, [fractionResolution, displayMode, defaultInputUnit]);

  const rows: {
    label: string;
    variant: BtnVariant;
    action: () => void;
    wide?: boolean;
    disabled?: boolean;
  }[][] = [
    [
      { label: 'AC', variant: 'function', action: calc.pressClear },
      { label: 'CE', variant: 'function', action: calc.pressClearEntry },
      { label: '⌫', variant: 'function', action: calc.pressBackspace },
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
      { label: '0', variant: 'number', action: () => calc.pressDigit(0) },
      { label: '.', variant: 'number', action: calc.pressDecimal, disabled: decimalDisabled },
      {
        label: 'a⁄c',
        variant: 'construction',
        action: calc.pressFraction,
        disabled: fractionsDisabled,
      },
    ],
  ];

  return (
    <PageChrome showMenu>
      <View style={[styles.root, { paddingHorizontal: r.padding }]}>
        <View style={styles.displayZone}>
          <Display
            value={calc.display}
            subValue={calc.subDisplay}
            hint={calc.inputHint}
            unit={calc.inputUnit}
            theme={theme}
            onToggleUnit={calc.toggleInputUnit}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fractionScroll}
          contentContainerStyle={[styles.fractionRow, { gap: r.buttonGap, paddingHorizontal: 2 }]}
        >
          {QUICK_FRACTIONS.map((f) => (
            <CalcButton
              key={f.label}
              label={f.label}
              variant="construction"
              theme={theme}
              fraction
              flex={0}
              disabled={fractionsDisabled}
              onPress={() => calc.pressQuickFraction(f.num, f.den)}
            />
          ))}
        </ScrollView>

        <View style={[styles.keypad, { paddingBottom: keypadInset }]}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((btn) => (
                <CalcButton
                  key={btn.label}
                  label={btn.label}
                  variant={btn.variant}
                  theme={theme}
                  wide={btn.wide}
                  disabled={btn.disabled}
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
    </PageChrome>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  displayZone: {
    flex: 1,
    minHeight: 80,
    justifyContent: 'flex-end',
  },
  fractionScroll: {
    flexGrow: 0,
    marginBottom: 2,
  },
  fractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keypad: {
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
  },
});