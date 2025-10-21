import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import RootLayout from './components/Layouts/RootLayout';
import NotFound from './pages/NotFound';

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Images = lazy(() => import("./pages/Images"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const VideoTemplates = lazy(() => import("./pages/VideoTemplates"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import('./pages/Admin/Admin'));

const publicRoutes = [
    {
        path: '/login',
        element: <Login />,
    },
];

// Routes accessible to everyone (with or without login)
const openRoutes = [
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/explore',
        element: <Images />,
    },
    {
        path: '/video-templates',
        element: <VideoTemplates />,
    },
    {
        path: '/about',
        element: <About />,
    },
    {
        path: '/contact',
        element: <Contact />,
    },
];

// Routes that require authentication
const protectedRoutes = [
    {
        path: '/profile',
        element: <Profile />,
    },
    {
        path: '/settings',
        element: <Settings />,
    },
];

export const AppRoutes = () => {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            }
        >
            <Routes>
                {/* Public Routes (no navbar) */}
                {publicRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}

                {/* Open Routes (with navbar, no login required) */}
                <Route element={<RootLayout />}>
                    {openRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}

                    {/* Protected Routes (require login) */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <Outlet />
                            </ProtectedRoute>
                        }
                    >
                        {protectedRoutes.map((route) => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Route>

                    {/* Admin Routes (require admin role) */}
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                </Route>

                <Route path="/" element={<Navigate to={'/dashboard'} replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};