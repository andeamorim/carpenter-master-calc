import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/hooks/useTheme';
import {
  SUBSCRIPTION_PERIOD,
  SUBSCRIPTION_PRICE,
  TRIAL_DAYS,
  useSubscriptionStore,
} from '../src/store/subscription';

const FEATURES = [
  'Full dimensional feet-inch-fraction calculator',
  'Right Angle, Rafter, Stair & Framing solvers',
  'Roofing materials estimator',
  'Board feet, drywall & compound miter (PRO)',
  'Paperless tape & memory functions',
  'Offline — works on any job site',
  'No ads, professional UX',
];

export default function PaywallScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const subscription = useSubscriptionStore();

  const handleStartTrial = () => {
    subscription.startTrial();
    router.back();
  };

  const handleSubscribe = () => {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    subscription.setSubscribed(true, expiry.toISOString());
    router.back();
  };

  return (
    <ScreenContainer scroll contentStyle={{ alignItems: 'center', paddingBottom: r.padding * 2 }}>
      <Stack.Screen options={{ title: 'Carpenter Master Calc Pro' }} />
      <Text style={[styles.emoji, { fontSize: r.isCompactWidth ? 40 : 48 }]}>🔨</Text>
      <Text style={[styles.title, { color: theme.text, fontSize: r.isCompactWidth ? 20 : 24 }]}>
        Professional Job-Site Calculator
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: r.isCompactWidth ? 14 : 15 }]}>
        Built for US carpenters. Imperial feet-inch-fraction precision.
      </Text>

      <View style={[styles.priceCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
        <Text style={[styles.price, { color: theme.primary, fontSize: r.isCompactWidth ? 36 : 42 }]}>
          {SUBSCRIPTION_PRICE}
        </Text>
        <Text style={[styles.period, { color: theme.textSecondary }]}>per {SUBSCRIPTION_PERIOD}</Text>
        <Text style={[styles.trial, { color: theme.accent }]}>
          {TRIAL_DAYS}-day free trial included
        </Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={{ color: theme.accent, fontSize: 16 }}>✓</Text>
            <Text style={[styles.featureText, { color: theme.text, fontSize: r.hintFontSize }]}>{f}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
        onPress={handleStartTrial}
      >
        <Text style={styles.primaryBtnText}>Start Free Trial</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryBtn, { borderColor: theme.border }]}
        onPress={handleSubscribe}
      >
        <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
          Subscribe Now — {SUBSCRIPTION_PRICE}/{SUBSCRIPTION_PERIOD}
        </Text>
      </Pressable>

      <Text style={[styles.legal, { color: theme.textSecondary }]}>
        Payment charged to your Apple ID or Google Play account. Subscription auto-renews unless
        canceled 24 hours before period ends. Manage in device settings.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emoji: { marginBottom: 12 },
  title: { fontWeight: '800', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 8, lineHeight: 22, maxWidth: 400 },
  priceCard: {
    marginTop: 28,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  price: { fontWeight: '800' },
  period: { fontSize: 16, marginTop: 4 },
  trial: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  features: { width: '100%', maxWidth: 400, marginTop: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  featureText: { flex: 1, lineHeight: 20 },
  primaryBtn: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, maxWidth: 400 },
});