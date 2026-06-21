import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settings';
import { useSubscriptionStore } from '../src/store/subscription';

export default function RootLayout() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const { isSubscribed, isTrialActive, trialStartDate, hasAccess } = useSubscriptionStore();

  useEffect(() => {
    if (!isSubscribed && !isTrialActive && !trialStartDate) {
      const timer = setTimeout(() => router.push('/paywall'), 800);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, isTrialActive, trialStartDate, hasAccess]);

  return (
    <SafeAreaProvider>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ez-calcs" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', headerShown: true, title: 'Subscribe' }}
        />
        <Stack.Screen name="calculators" />
      </Stack>
    </SafeAreaProvider>
  );
}