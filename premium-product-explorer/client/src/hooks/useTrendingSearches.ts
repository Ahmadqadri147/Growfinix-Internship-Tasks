import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";

export function useTrendingSearches() {
  return useQuery({
    queryKey: ["trending-searches"],
    queryFn: () => searchService.trending(7, 10),
    staleTime: 10 * 60 * 1000
  });
}
