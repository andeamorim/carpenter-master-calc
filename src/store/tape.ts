import { create } from 'zustand';
import type { TapeEntry } from '../types';

interface TapeStore {
  entries: TapeEntry[];
  addEntry: (expression: string, result: string) => void;
  clearTape: () => void;
}

export const useTapeStore = create<TapeStore>((set) => ({
  entries: [],
  addEntry: (expression, result) =>
    set((state) => ({
      entries: [
        {
          id: Date.now().toString(),
          expression,
          result,
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, 50),
    })),
  clearTape: () => set({ entries: [] }),
}));