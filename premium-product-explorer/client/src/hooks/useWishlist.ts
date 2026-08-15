import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wishlistService } from "@/services/commerce.service";
import { useAuthStore } from "@/store/authStore";

export function useWishlist() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const wishlist = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getAll(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000
  });

  const ids = new Set(wishlist.data?.items.map((p) => p.id) ?? []);

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (ids.has(productId)) {
        await wishlistService.remove(productId);
        return { productId, removed: true };
      }
      const result = await wishlistService.add(productId);
      return { productId, removed: !result.added };
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData<{ items: { id: string }[] }>(["wishlist"], (old) =>
        old
          ? {
              ...old,
              items: ids.has(productId)
                ? old.items.filter((p) => p.id !== productId)
                : [{ id: productId }, ...old.items]
            }
          : old
      );
      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(["wishlist"], context.previous);
      toast.error("Could not update wishlist");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] })
  });

  return {
    wishlist,
    ids,
    isWishlisted: (productId: string) => ids.has(productId),
    toggleWishlist: toggle.mutateAsync,
    count: ids.size
  };
}
