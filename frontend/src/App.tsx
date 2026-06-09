import { Suspense, lazy } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Skeleton } from "./components/ui/skeleton";

const Landing = lazy(() =>
  import("./pages/Landing").then((module) => ({ default: module.Landing }))
);
const AuthPage = lazy(() =>
  import("./pages/Auth").then((module) => ({ default: module.AuthPage }))
);
const Upload = lazy(() =>
  import("./pages/Upload").then((module) => ({ default: module.Upload }))
);
const Query = lazy(() =>
  import("./pages/Query").then((module) => ({ default: module.Query }))
);
const Graph = lazy(() =>
  import("./pages/Graph").then((module) => ({ default: module.Graph }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-[60vh] w-full rounded-3xl" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/upload" element={<Navigate to="/app/upload" replace />} />
                <Route path="/query" element={<Navigate to="/app/query" replace />} />
                <Route path="/graph" element={<Navigate to="/app/graph" replace />} />
                <Route path="/app" element={<ProtectedRoute />}>
                  <Route index element={<Navigate to="/app/upload" replace />} />
                  <Route path="upload" element={<Upload />} />
                  <Route path="query" element={<Query />} />
                  <Route path="graph" element={<Graph />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
