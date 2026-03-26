import { create } from 'zustand';
import * as Containers from '../../allContainers';

interface ScreenState {
  currentContainerId: string | null;
  currentStateId: string | null;
  currentScreen: any | null;
  history: { containerId: string; stateId: string }[];
  screenData: Record<string, any>; // Data for interpolation
}

interface ScreenStore extends ScreenState {
  loadScreen: (containerId: string, stateId: string) => void;
  goBack: () => void;
  setScreenData: (data: Record<string, any>) => void;
  updateScreenData: (key: string, value: any) => void;
}

export const useScreenStore = create<ScreenStore>((set, get) => ({
  currentContainerId: null,
  currentStateId: null,
  currentScreen: null,
  history: [],
  screenData: {},

  loadScreen: (containerId, stateId) => {
    const container = (Containers as any)[`${containerId.charAt(0).toUpperCase() + containerId.slice(1)}Container`] || 
                    (Containers as any)[containerId];
    
    if (!container || !container.states[stateId]) {
      console.warn(`Screen not found: ${containerId}.${stateId}`);
      return;
    }

    const { currentContainerId, currentStateId, history } = get();
    
    // Add to history if it's not the same screen
    const newHistory = [...history];
    if (currentContainerId && currentStateId) {
      newHistory.push({ containerId: currentContainerId, stateId: currentStateId });
    }

    set({
      currentContainerId: containerId,
      currentStateId: stateId,
      currentScreen: container.states[stateId],
      history: newHistory,
    });
  },

  goBack: () => {
    const { history } = get();
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    const container = (Containers as any)[`${previous.containerId.charAt(0).toUpperCase() + previous.containerId.slice(1)}Container`] || 
                    (Containers as any)[previous.containerId];

    set({
      currentContainerId: previous.containerId,
      currentStateId: previous.stateId,
      currentScreen: container?.states[previous.stateId] || null,
      history: newHistory,
    });
  },

  setScreenData: (data) => set({ screenData: data }),
  
  updateScreenData: (key, value) => set((state) => ({
    screenData: { ...state.screenData, [key]: value }
  })),
}));
