/** components/ui/button.tsx — Botão base com 3 variantes visuais (primary/secondary/sync). */
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "sync";
};

export function Button({ variant = "secondary", className, children, ...props }: ButtonProps) {
  const styles = {
    primary: "bg-accent-gradient shadow-accent text-white font-semibold hover:brightness-110",
    secondary: "bg-card text-ink border border-border font-semibold hover:bg-card-2",
    sync: "flex-1 bg-white/6 border border-border text-ink font-semibold hover:bg-white/10",
  }[variant];

  return (
    <button
      className={cn(
        "flex cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
