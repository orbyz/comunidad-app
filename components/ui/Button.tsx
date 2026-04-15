"use client";

import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-white hover:opacity-90",
    danger: "bg-destructive text-white hover:opacity-90",
    ghost: "bg-transparent hover:bg-muted",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
