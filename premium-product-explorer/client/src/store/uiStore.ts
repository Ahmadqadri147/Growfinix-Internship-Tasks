import { create } from "zustand";
import type { Product } from "@/types";

interface UiState {
  quickViewProduct: Product | null;
  openQuickView: (product: Product | null) => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  quickViewProduct: null,
  openQuickView: (product) => set({ quickViewProduct: product }),
  mobileFiltersOpen: false,
  setMobileFiltersOpen: (open) => set({ mobileFiltersOpen: open }),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open })
}));