import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-sand-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 ${className}`}
      {...props}
    />
  );
}
