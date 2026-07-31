import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, GlassCard } from "@/components/ui";
import { useRegister } from "@/hooks/useAuth";
import { toast } from "sonner";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
  return { label: "Strong", color: "bg-green-500", width: "w-full" };
}

export default function Register() {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeTerms: false },
  });

  useEffect(() => {
    document.title = "Create Account | Midnight Royale Gala";
  }, []);

  const password = watch("password") || "";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const [firstName, ...lastParts] = data.fullName.trim().split(" ");
      await registerMutation.mutateAsync({
        firstName,
        lastName: lastParts.join(" ") || "",
        email: data.email,
        password: data.password,
      });
    } catch {
      toast.error("Registration failed. Please try again.");
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
              <h1 className="font-serif text-3xl font-bold gold-text">Create Account</h1>
              <p className="mt-2 text-gray-400">Join the Midnight Royale experience</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                id="fullName"
                placeholder="John Doe"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Phone"
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold-500/50 focus:bg-white/10 focus:ring-1 focus:ring-gold-500/30"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        animate={{ width: strength.width }}
                        className={`rounded-full ${strength.color} transition-all duration-300`}
                      />
                    </div>
                    <p className={`text-xs ${strength.color.replace("bg-", "text-")}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  At least 8 characters with uppercase, lowercase, number, and symbol
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-gold-500/50 focus:bg-white/10 focus:ring-1 focus:ring-gold-500/30"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...register("agreeTerms")}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm text-gray-400">
                  I agree to the{" "}
                  <button type="button" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-400">{errors.agreeTerms.message}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={registerMutation.isPending}
                icon={<UserPlus className="h-5 w-5" />}
              >
                Create Account
              </Button>
            </form>

            {registerMutation.isError && (
              <p className="mt-3 text-center text-sm text-red-400">
                {registerMutation.error?.message || "Registration failed"}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium text-gold-400 hover:text-gold-300">
                Sign In
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
          <p className="mt-6 text-lg text-gray-400">Begin your journey</p>
        </div>
      </div>
    </div>
  );
}
