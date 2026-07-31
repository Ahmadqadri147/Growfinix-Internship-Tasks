import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, GlassCard } from "@/components/ui";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "sonner";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    document.title = "Sign In | Midnight Royale Gala";
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch {
      toast.error("Invalid email or password");
    }
  };

  const quickLogin = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      useAuthStore.getState().setAuth(res.user, res.token);
      toast.success(`Welcome ${res.user.name || "Guest"}!`);
      window.location.href = "/dashboard";
    } catch {
      toast.error("Quick login failed. Please use the form.");
    }
  };

  return (
    <div className="flex min-h-screen bg-midnight-950">
      <div className="flex flex-1 items-center justify-center px-6 lg:w-3/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl font-bold gold-text">Welcome Back</h1>
              <p className="mt-2 text-gray-400">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold-500/50 focus:bg-white/10 focus:ring-1 focus:ring-gold-500/30"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-gold-400 transition-colors hover:text-gold-300"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loginMutation.isPending}
                icon={<LogIn className="h-5 w-5" />}
              >
                Sign In
              </Button>
            </form>

            {loginMutation.isError && (
              <p className="mt-3 text-center text-sm text-red-400">
                {loginMutation.error?.message || "Invalid credentials"}
              </p>
            )}

            <div className="my-6 flex items-center gap-4">
              <hr className="flex-1 border-white/10" />
              <span className="text-sm text-gray-500">or</span>
              <hr className="flex-1 border-white/10" />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => quickLogin("guest@midnightroyale.com", "User@1234")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => quickLogin("admin@midnightroyale.com", "Admin@123")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/auth/register" className="font-medium text-gold-400 hover:text-gold-300">
                Register
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>

      <div className="relative hidden w-2/5 items-center justify-center overflow-hidden bg-midnight-900 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08),transparent_70%)]" />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        <div className="relative z-10 text-center">
          <p className="font-serif text-5xl font-bold gold-text">MIDNIGHT</p>
          <p className="font-serif text-5xl font-bold text-white">ROYALE</p>
          <p className="font-serif text-5xl font-bold gold-text">GALA</p>
          <p className="mt-6 text-lg text-gray-400">Welcome back, dignitary</p>
        </div>
      </div>
    </div>
  );
}
