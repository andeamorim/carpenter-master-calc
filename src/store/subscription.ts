import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SUBSCRIPTION_PRICE = '$4.99';
export const SUBSCRIPTION_PERIOD = 'month';
export const TRIAL_DAYS = 14;

export const PRODUCT_IDS = {
  ios: 'com.carpentermaster.calc.monthly',
  android: 'com.carpentermaster.calc.monthly',
  annualIos: 'com.carpentermaster.calc.annual',
  annualAndroid: 'com.carpentermaster.calc.annual',
};

interface SubscriptionStore {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialStartDate: string | null;
  subscriptionExpiry: string | null;
  setSubscribed: (value: boolean, expiry?: string) => void;
  startTrial: () => void;
  hasAccess: () => boolean;
  daysLeftInTrial: () => number;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      isSubscribed: false,
      isTrialActive: false,
      trialStartDate: null,
      subscriptionExpiry: null,

      setSubscribed: (value, expiry) =>
        set({
          isSubscribed: value,
          subscriptionExpiry: expiry ?? null,
          isTrialActive: false,
        }),

      startTrial: () => {
        const now = new Date().toISOString();
        set({ isTrialActive: true, trialStartDate: now });
      },

      hasAccess: () => {
        const state = get();
        if (state.isSubscribed) return true;
        if (!state.isTrialActive || !state.trialStartDate) return false;
        const start = new Date(state.trialStartDate);
        const now = new Date();
        const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= TRIAL_DAYS;
      },

      daysLeftInTrial: () => {
        const state = get();
        if (!state.isTrialActive || !state.trialStartDate) return 0;
        const start = new Date(state.trialStartDate);
        const now = new Date();
        const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));
      },
    }),
    {
      name: 'carpenter-subscription',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);