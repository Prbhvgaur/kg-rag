import {
  ButtonHTMLAttributes,
  Children,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  createContext,
  useContext
} from "react";

interface TabsContextValue {
  value: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends PropsWithChildren {
  value: string;
}

export function Tabs({ value, children }: TabsProps) {
  return <TabsContext.Provider value={{ value }}>{children}</TabsContext.Provider>;
}

export function TabsList({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`inline-flex rounded-2xl border border-sand-200 bg-sand-100 p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  className = "",
  value,
  children,
  ...props
}: PropsWithChildren<TabsTriggerProps>) {
  const context = useContext(TabsContext);
  const active = context?.value === value;
  return (
    <button
      className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${active ? "bg-white text-sand-900 shadow-sm" : "text-sand-600"} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  value: string;
}

export function TabsContent({ value, children, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (context?.value !== value) {
    return null;
  }
  return <div {...props}>{children}</div>;
}
