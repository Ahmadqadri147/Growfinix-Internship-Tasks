import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { useDebounce } from "./useDebounce";

export function useSuggestions(rawQuery: string, enabled = true) {
  const q = useDebounce(rawQuery, 250);
  return useQuery({
    queryKey: ["suggestions", q],
    queryFn: () => productService.getSuggestions(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 60 * 1000,
    retry: false
  });
}
