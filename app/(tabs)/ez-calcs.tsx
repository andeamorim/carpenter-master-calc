import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { EZ_CALCS } from '../../src/data/ez-calcs';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/hooks/useTheme';
import { useSubscriptionStore } from '../../src/store/subscription';

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
    <ScreenContainer>
      <FlatList
        data={EZ_CALCS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { padding: r.padding, paddingBottom: r.padding * 2 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.header, { color: theme.textSecondary, fontSize: r.isCompactWidth ? 13 : 14 }]}>
            Guided calculators for job-site tasks. Tap to open.
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
                opacity: pressed ? 0.8 : 1,
                padding: r.isCompactWidth ? 12 : 16,
              },
            ]}
          >
            <Text style={[styles.icon, { fontSize: r.isCompactWidth ? 24 : 28 }]}>{item.icon}</Text>
            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: theme.text, fontSize: r.isCompactWidth ? 15 : 17 }]}>
                  {item.title}
                </Text>
                {item.premium && (
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.badgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.desc, { color: theme.textSecondary, fontSize: r.hintFontSize }]}>
                {item.description}
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  header: { marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  icon: { marginRight: 12 },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { fontWeight: '700' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  desc: { marginTop: 4 },
  arrow: { fontSize: 24, fontWeight: '300', marginLeft: 8 },
});