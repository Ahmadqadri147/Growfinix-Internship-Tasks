import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isAuthenticated, setAuth, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: freshUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (freshUser && freshUser.id !== user?.id) {
      setUser(freshUser);
    }
  }, [freshUser, user?.id, setUser]);

  const login = useMutation({
    mutationFn: (input: { email: string; password: string }) => authService.login(input),
    onSuccess: ({ user: u, token }) => {
      setAuth(u, token);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
      navigate("/");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Login failed")
  });

  const register = useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) => authService.register(input),
    onSuccess: ({ user: u, token }) => {
      setAuth(u, token);
      toast.success(`Welcome to Premium Product Explorer, ${u.name.split(" ")[0]}!`);
      navigate("/");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Registration failed")
  });

  const signOut = () => {
    logout();
    queryClient.clear();
    navigate("/");
    toast.info("Signed out");
  };

  return {
    user: freshUser ?? user,
    isAuthenticated,
    isAdmin: freshUser?.role === "ADMIN" || user?.role === "ADMIN",
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: signOut,
    loading: login.isPending || register.isPending
  };
}
