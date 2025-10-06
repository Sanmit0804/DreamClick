// App.tsx
import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "sonner";
import RootLayout from "./components/Layouts/RootLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Lazy load pages with proper error boundaries
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Images = lazy(() => import("./pages/Images"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            {/* Public Auth Routes - No Navbar */}
              <Route path="/login" element={<Login />} />

            {/* Protected Routes - With Navbar */}
            <Route
              element={
                <ProtectedRoute>
                  <RootLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/images" element={<Images />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;