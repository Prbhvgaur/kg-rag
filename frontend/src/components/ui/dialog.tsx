import { HTMLAttributes, PropsWithChildren } from "react";

interface DialogProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ open, children }: DialogProps) {
  if (!open) {
    return null;
  }
  return <>{children}</>;
}

export function DialogContent({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sand-900/40 px-4">
      <div
        className={`w-full max-w-lg rounded-3xl border border-sand-200 bg-white p-6 shadow-panel ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={`mb-4 space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={`text-lg font-semibold text-sand-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function DialogDescription({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={`text-sm text-sand-600 ${className}`} {...props}>
      {children}
    </p>
  );
}
