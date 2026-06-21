import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PageChrome } from '../src/components/PageChrome';
import { EZ_CALCS } from '../src/data/ez-calcs';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/hooks/useTheme';
import { useSubscriptionStore } from '../src/store/subscription';

export default function EZCalcsScreen() {
  const theme = useTheme();
  const r = useResponsive();
  const hasAccess = useSubscriptionStore((s) => s.hasAccess());

  const handlePress = (item: (typeof EZ_CALCS)[0]) => {
    if (item.premium && !hasAccess) {
      router.push('/paywall');
      return;
    }
    router.push(item.route as '/calculators/right-angle');
  };

  return (
    <PageChrome title="EZ Calcs" showBack onBack={() => router.back()}>
      <FlatList
        data={EZ_CALCS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { padding: r.padding, paddingBottom: r.padding * 3 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.header, { color: theme.textSecondary, fontSize: r.hintFontSize }]}>
            Guided calculators for job-site tasks
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: pressed ? 0.85 : 1,
                padding: r.isCompactWidth ? 14 : 16,
              },
            ]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                {item.premium && (
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.badgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>{item.description}</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </Pressable>
        )}
      />
    </PageChrome>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  header: { marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  icon: { fontSize: 26, marginRight: 14 },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  desc: { marginTop: 4, fontSize: 13 },
  arrow: { fontSize: 22, marginLeft: 8 },
});