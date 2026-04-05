import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent-500 text-white hover:bg-accent-600",
  secondary: "bg-sand-200 text-sand-900 hover:bg-sand-300",
  ghost: "bg-transparent text-sand-700 hover:bg-sand-100"
};

export function buttonClassName(variant: Variant = "primary", className = "") {
  return `inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
}

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
