import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        gold: "bg-gold-500/10 text-gold-400 border border-gold-500/30",
        silver: "bg-gray-400/10 text-gray-300 border border-gray-400/30",
        success: "bg-green-500/10 text-green-400 border border-green-500/30",
        warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
        error: "bg-red-500/10 text-red-400 border border-red-500/30",
        info: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export default function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
