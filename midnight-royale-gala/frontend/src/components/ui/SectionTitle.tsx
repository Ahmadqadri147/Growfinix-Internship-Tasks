import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import GoldenDivider from "./GoldenDivider";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  light?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
  light = false,
  className,
  children,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        align === "right" && "text-right",
        align === "left" && "text-left",
        className,
      )}
    >
      <h2
        className={cn(
          "font-serif text-3xl font-bold sm:text-4xl lg:text-5xl",
          light ? "text-white" : "gold-text",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed",
            align === "center" && "mx-auto",
            light ? "text-gray-300" : "text-gray-400",
          )}
        >
          {subtitle}
        </p>
      )}
      {children}
      <div
        className={cn(
          "mt-6",
          align === "center" && "flex justify-center",
          align === "right" && "flex justify-end",
        )}
      >
        <GoldenDivider />
      </div>
    </div>
  );
}
