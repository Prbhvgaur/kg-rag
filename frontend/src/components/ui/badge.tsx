import { HTMLAttributes, PropsWithChildren } from "react";

export function Badge({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-sand-200 bg-sand-100 px-2.5 py-1 text-xs font-medium text-sand-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
