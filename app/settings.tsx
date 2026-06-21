import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PageChrome } from '../src/components/PageChrome';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/hooks/useTheme';
import {
  SUBSCRIPTION_PRICE,
  TRIAL_DAYS,
  useSubscriptionStore,
} from '../src/store/subscription';
import { useSettingsStore } from '../src/store/settings';
import type { DisplayMode, FractionResolution, InputUnit } from '../src/types';

const RESOLUTIONS: FractionResolution[] = [2, 4, 8, 16, 32, 64];
const DISPLAY_MODES: { value: DisplayMode; label: string }[] = [
  { value: 'ft-in-frac', label: 'Feet-Inch-Fraction' },
  { value: 'ft-decimal', label: 'Decimal Feet' },
  { value: 'in-frac', label: 'Inch-Fraction' },
  { value: 'decimal-in', label: 'Decimal Inches' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const settings = useSettingsStore();
  const subscription = useSubscriptionStore();
  const hasAccess = subscription.hasAccess();

  return (
    <PageChrome title="Settings" showBack onBack={() => router.back()}>
      <ScrollView
        contentContainerStyle={{ padding: r.padding, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Subscription" theme={theme}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {hasAccess ? '✓ Active Access' : 'No Active Subscription'}
            </Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
              {subscription.isSubscribed
                ? 'Monthly plan active'
                : subscription.isTrialActive
                  ? `Trial: ${subscription.daysLeftInTrial()} days remaining`
                  : `Start ${TRIAL_DAYS}-day free trial, then ${SUBSCRIPTION_PRICE}/month`}
            </Text>
            {!hasAccess && (
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/paywall')}
              >
                <Text style={styles.buttonText}>Subscribe — {SUBSCRIPTION_PRICE}/mo</Text>
              </Pressable>
            )}
          </View>
        </Section>

        <Section title="Display" theme={theme}>
          <SettingRow label="Dark Mode" theme={theme}>
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => settings.updateSettings({ darkMode: v })}
              trackColor={{ true: theme.primary }}
            />
          </SettingRow>
          <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Rounding Precision</Text>
          <Text style={[styles.helpText, { color: theme.textSecondary }]}>
            Default 1/16&quot;. Internal math stays at 1/64&quot; for accuracy.
          </Text>
          <View style={styles.chipRow}>
            {RESOLUTIONS.map((res) => (
              <Pressable
                key={res}
                onPress={() => settings.updateSettings({ fractionResolution: res })}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      settings.fractionResolution === res ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: settings.fractionResolution === res ? '#fff' : theme.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  1/{res}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.subLabel, { color: theme.textSecondary, marginTop: 12 }]}>
            Default Unit
          </Text>
          <Text style={[styles.helpText, { color: theme.textSecondary }]}>
            Numbers and calculations use this unit until you tap ft↔in on the calculator.
          </Text>
          <View style={styles.chipRow}>
            {([
              { value: 'inches' as InputUnit, label: 'Inches' },
              { value: 'feet' as InputUnit, label: 'Feet' },
            ]).map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => settings.updateSettings({ defaultInputUnit: opt.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      settings.defaultInputUnit === opt.value ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: settings.defaultInputUnit === opt.value ? '#fff' : theme.text,
                    fontWeight: '600',
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.subLabel, { color: theme.textSecondary, marginTop: 12 }]}>
            Display Format
          </Text>
          {DISPLAY_MODES.map((mode) => (
            <Pressable
              key={mode.value}
              onPress={() => settings.updateSettings({ displayMode: mode.value })}
              style={[
                styles.option,
                {
                  backgroundColor:
                    settings.displayMode === mode.value ? theme.surfaceElevated : theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: theme.text }}>{mode.label}</Text>
              {settings.displayMode === mode.value && (
                <Text style={{ color: theme.primary }}>✓</Text>
              )}
            </Pressable>
          ))}
        </Section>

        <Section title="Defaults" theme={theme}>
          <SettingRow label="Stud Spacing" theme={theme}>
            <View style={styles.chipRow}>
              {([16, 24] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => settings.updateSettings({ defaultStudSpacing: s })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        settings.defaultStudSpacing === s ? theme.primary : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: settings.defaultStudSpacing === s ? '#fff' : theme.text,
                      fontWeight: '600',
                    }}
                  >
                    {s}&quot; o.c.
                  </Text>
                </Pressable>
              ))}
            </View>
          </SettingRow>
        </Section>

        <Text style={[styles.version, { color: theme.textSecondary }]}>
          Carpenter Master Calc v1.0.0
        </Text>
      </ScrollView>
    </PageChrome>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ReturnType<typeof useTheme>;
  children: React.ReactNode;
}) {
  const r = useResponsive();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text, fontSize: r.sectionTitleFontSize }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SettingRow({
  label,
  theme,
  children,
}: {
  label: string;
  theme: ReturnType<typeof useTheme>;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.settingRow, { borderColor: theme.border }]}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  card: { padding: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  button: { padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: { fontSize: 15 },
  subLabel: { fontSize: 13, marginBottom: 8, marginTop: 8 },
  helpText: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});