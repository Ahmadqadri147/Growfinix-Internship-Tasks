import { motion } from "framer-motion";
import { SearchX, PackageSearch, Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "search" | "products" | "default";
  actionLabel?: string;
  onAction?: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  search: SearchX,
  products: PackageSearch,
  default: Inbox
};

export function EmptyState({ title, description, icon = "default", actionLabel, onAction }: EmptyStateProps) {
  const Icon = ICONS[icon] ?? ICONS.default;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
