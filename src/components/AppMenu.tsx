import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { SUBSCRIPTION_PRICE, useSubscriptionStore } from '../store/subscription';

type Route = '/' | '/ez-calcs' | '/projects' | '/settings' | '/paywall';

interface MenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  route: Route;
  accent?: boolean;
}

const ITEMS: MenuItem[] = [
  { id: 'calc', label: 'Calculator', subtitle: 'Feet · inch · fraction', icon: '🔢', route: '/' },
  { id: 'ez', label: 'EZ Calcs', subtitle: 'Rafters, stairs, framing', icon: '📐', route: '/ez-calcs' },
  { id: 'projects', label: 'Projects', subtitle: 'Notes & job history', icon: '📁', route: '/projects' },
  { id: 'settings', label: 'Settings', subtitle: 'Display & precision', icon: '⚙️', route: '/settings' },
];

interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function AppMenu({ visible, onClose }: AppMenuProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const hasAccess = useSubscriptionStore((s) => s.hasAccess());

  const navigate = (route: Route) => {
    onClose();
    if (route === '/') {
      router.replace('/');
    } else {
      router.push(route);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.panel,
            {
              backgroundColor: theme.surface,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 16,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.brand, { color: theme.text }]}>Carpenter Master</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Job-site calculator
          </Text>

          <View style={styles.items}>
            {ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => navigate(item.route)}
                style={({ pressed }) => [
                  styles.item,
                  { backgroundColor: pressed ? theme.surfaceElevated : 'transparent' },
                ]}
              >
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemLabel, { color: theme.text }]}>{item.label}</Text>
                  <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
              </Pressable>
            ))}
          </View>

          {!hasAccess && (
            <Pressable
              onPress={() => navigate('/paywall')}
              style={[styles.proBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.proBtnText}>Upgrade Pro — {SUBSCRIPTION_PRICE}/mo</Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.closeArea}>
            <Text style={[styles.closeText, { color: theme.textSecondary }]}>Close menu</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
  },
  panel: {
    width: '82%',
    maxWidth: 320,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: { fontSize: 22, fontWeight: '800' },
  tagline: { fontSize: 13, marginTop: 2, marginBottom: 20 },
  items: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  itemIcon: { fontSize: 24, width: 36 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 17, fontWeight: '700' },
  itemSub: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },
  proBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  proBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  closeArea: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
  closeText: { fontSize: 14 },
});