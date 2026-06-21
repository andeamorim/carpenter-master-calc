import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PageChrome } from '../src/components/PageChrome';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/hooks/useTheme';

export default function ProjectsScreen() {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <PageChrome title="Projects" showBack onBack={() => router.back()}>
      <View style={[styles.content, { padding: r.padding * 2 }]}>
        <Text style={styles.emoji}>📁</Text>
        <Text style={[styles.title, { color: theme.text }]}>Project Notes</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          Save calculations, voice notes, and photos per project. Coming in the next release.
        </Text>
        <View style={[styles.coming, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Text style={[styles.comingText, { color: theme.primary }]}>
            Phase 2 — Cloud backup & team sharing
          </Text>
        </View>
      </View>
    </PageChrome>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  coming: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  comingText: { fontWeight: '600', textAlign: 'center', fontSize: 13 },
});