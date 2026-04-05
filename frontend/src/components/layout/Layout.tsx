import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

import { Navbar } from "./Navbar";

export function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");

  return (
    <div className="min-h-screen bg-paper-grid bg-[size:24px_24px]">
      <Navbar />
      <main className={`mx-auto px-4 pb-12 pt-8 ${isAppRoute ? "max-w-6xl" : "max-w-7xl"}`}>
        {children}
      </main>
    </div>
  );
}
