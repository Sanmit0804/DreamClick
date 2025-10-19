import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import RootLayout from './components/Layouts/RootLayout';
import NotFound from './pages/NotFound';
import EditUser from './pages/Admin/UserManagement/EditUser';

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Images = lazy(() => import("./pages/Images"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import('./pages/Admin/Admin'));

const publicRoutes = [
    {
        path: '/login',
        element: <Login />,
    },
];

const protectedRoutes = [
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/images',
        element: <Images />,
    },
    {
        path: '/profile',
        element: <Profile />,
    },
    {
        path: '/settings',
        element: <Settings />,
    },
];

const adminRoutes = [
    // go to Admin page to add more routes of admin
    {
        path: '/admin/*', // Use wildcard to allow Admin to handle its own sub-routes
        element: <Admin />,
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
                {/* Public Routes */}
                {publicRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <RootLayout />
                        </ProtectedRoute>
                    }
                >
                    {protectedRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}

                    {/* Admin Routes - Protected by both authentication and role */}
                    {adminRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <AdminRoute>
                                    {route.element}
                                </AdminRoute>
                            }
                        />
                    ))}
                </Route>

                <Route path="/" element={<Navigate to={'/dashboard'} replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};