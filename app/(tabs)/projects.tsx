import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/hooks/useTheme';

export default function ProjectsScreen() {
  const theme = useTheme();
  const r = useResponsive();

  return (
    <ScreenContainer centerContent>
      <View style={[styles.content, { padding: r.padding * 2 }]}>
        <Text style={[styles.emoji, { fontSize: r.isCompactWidth ? 40 : 48 }]}>📁</Text>
        <Text style={[styles.title, { color: theme.text, fontSize: r.isCompactWidth ? 20 : 22 }]}>
          Project Notes
        </Text>
        <Text
          style={[
            styles.desc,
            { color: theme.textSecondary, fontSize: r.isCompactWidth ? 14 : 15, maxWidth: 360 },
          ]}
        >
          Save calculations, voice notes, and photos per project. Coming in the next release
          after initial testing.
        </Text>
        <View style={[styles.coming, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Text style={[styles.comingText, { color: theme.primary, fontSize: r.hintFontSize }]}>
            Phase 2 — Cloud backup & team sharing
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { marginBottom: 16 },
  title: { fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  desc: { textAlign: 'center', lineHeight: 22 },
  coming: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  comingText: { fontWeight: '600', textAlign: 'center' },
});