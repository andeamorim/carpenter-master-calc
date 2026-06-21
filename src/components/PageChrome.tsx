import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';
import { AppMenu } from './AppMenu';

interface PageChromeProps {
  children: ReactNode;
  title?: string;
  showMenu?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function PageChrome({
  children,
  title,
  showMenu = false,
  showBack = false,
  onBack,
  rightAction,
}: PageChromeProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.toolbar,
          {
            paddingTop: insets.top + 4,
            paddingHorizontal: r.padding,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={styles.toolbarSide}>
          {showMenu && (
            <Pressable
              onPress={() => setMenuOpen(true)}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={12}
            >
              <Text style={[styles.menuIcon, { color: theme.primary }]}>☰</Text>
            </Pressable>
          )}
          {showBack && onBack && (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={12}
            >
              <Text style={[styles.backIcon, { color: theme.primary }]}>‹</Text>
            </Pressable>
          )}
        </View>

        {title ? (
          <Text
            style={[styles.title, { color: theme.text, fontSize: r.isCompactWidth ? 16 : 18 }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          <View style={styles.title} />
        )}

        <View style={[styles.toolbarSide, styles.toolbarRight]}>{rightAction}</View>
      </View>

      <View style={styles.body}>{children}</View>

      {showMenu && <AppMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingBottom: 6,
  },
  toolbarSide: { width: 48, alignItems: 'flex-start' },
  toolbarRight: { alignItems: 'flex-end' },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 22, fontWeight: '700' },
  backIcon: { fontSize: 32, fontWeight: '300', marginTop: -4 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  body: { flex: 1, minHeight: 0 },
});