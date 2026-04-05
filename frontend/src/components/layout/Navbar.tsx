import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthProvider";
import { useAppStore } from "../../store/useAppStore";
import { Badge } from "../ui/badge";
import { Button, buttonClassName } from "../ui/button";

const appLinks = [
  { to: "/app/upload", label: "Upload" },
  { to: "/app/query", label: "Query" },
  { to: "/app/graph", label: "Graph" }
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const resetStore = useAppStore((state) => state.resetStore);
  const isAppRoute = location.pathname.startsWith("/app");

  async function handleSignOut() {
    await signOut();
    resetStore();
    navigate("/", { replace: true });
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-sand-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="block">
          <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Knowledge Graph RAG</div>
          <div className="text-lg font-semibold tracking-tight text-sand-900">KG-RAG</div>
        </Link>

        <div className="flex items-center gap-3">
          {isAppRoute ? (
            <div className="flex items-center gap-2 rounded-2xl border border-sand-200 bg-sand-100/80 p-1">
              {appLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-white font-medium text-sand-900 shadow-sm"
                        : "text-sand-600 hover:text-sand-900"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="hidden items-center gap-5 text-sm text-sand-600 md:flex">
              <a href="/#features" className="transition hover:text-sand-900">
                Features
              </a>
              <a href="/#workflow" className="transition hover:text-sand-900">
                Workflow
              </a>
            </div>
          )}

          {user ? (
            <>
              <Badge className="hidden sm:inline-flex">{user.email ?? "Authenticated"}</Badge>
              <Button variant="secondary" onClick={() => navigate("/app/upload")}>
                Workspace
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" className={buttonClassName("secondary")}>
                Sign In
              </Link>
              <Link to="/auth" className={buttonClassName("primary")}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
