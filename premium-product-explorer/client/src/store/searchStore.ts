import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  recentSearches: string[];
  addRecent: (query: string) => void;
  removeRecent: (query: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecent: (query) =>
        set((state) => ({
          recentSearches: [query, ...state.recentSearches.filter((q) => q.toLowerCase() !== query.toLowerCase())].slice(0, 8)
        })),
      removeRecent: (query) =>
        set((state) => ({ recentSearches: state.recentSearches.filter((q) => q !== query) })),
      clearRecent: () => set({ recentSearches: [] })
    }),
    { name: "ppe-search-history" }
  )
);
