import { create } from 'zustand';
import type { DemoProfile, Intent } from '@/lib/types';
import { DEMO_PROFILE } from '@/lib/seed-data';

interface ProfileState {
  profile: DemoProfile;
  selectedIntent: Intent | null;
  constraintsComplete: boolean;
  setSelectedIntent: (intent: Intent) => void;
  updateProfile: (patch: Partial<DemoProfile>) => void;
  markConstraintsComplete: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: DEMO_PROFILE,
  selectedIntent: null,
  constraintsComplete: false,
  setSelectedIntent: (intent) => set({ selectedIntent: intent }),
  updateProfile: (patch) =>
    set((state) => ({ profile: { ...state.profile, ...patch } })),
  markConstraintsComplete: () => set({ constraintsComplete: true }),
}));
