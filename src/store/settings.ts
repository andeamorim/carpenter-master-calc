import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppSettings } from '../types';
import { DEFAULT_STAIR_VALUES } from '../engine/stairs';

const defaultSettings: AppSettings = {
  fractionResolution: 16,
  displayMode: 'ft-in-frac',
  defaultStudSpacing: 16,
  defaultRiserHeight: DEFAULT_STAIR_VALUES.riserHeight,
  defaultTreadWidth: DEFAULT_STAIR_VALUES.treadWidth,
  defaultHeadroom: DEFAULT_STAIR_VALUES.headroom,
  defaultFloorThickness: DEFAULT_STAIR_VALUES.floorThickness,
  darkMode: true,
};

interface SettingsStore extends AppSettings {
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetDefaults: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
      resetDefaults: () => set(defaultSettings),
    }),
    {
      name: 'carpenter-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as AppSettings & Record<string, unknown>;
        for (const key of [
          'defaultRiserHeight',
          'defaultTreadWidth',
          'defaultHeadroom',
          'defaultFloorThickness',
        ]) {
          const val = state[key] as { sixteenths?: number; units?: number } | undefined;
          if (val?.sixteenths !== undefined && val.units === undefined) {
            val.units = val.sixteenths * 4;
            delete val.sixteenths;
          }
        }
        return state as AppSettings;
      },
    },
  ),
);