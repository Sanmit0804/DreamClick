import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import RootLayout from './components/Layouts/RootLayout';
import NotFound from './pages/NotFound';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Images = lazy(() => import('./pages/Images'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const VideoTemplates = lazy(() => import('./pages/Templates/VideoTemplates'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin/Admin'));

// Public routes (no navbar / no auth needed)
const publicRoutes = [{ path: '/login', element: <Login /> }];

// Open to everyone (authenticated or not) — wrapped in RootLayout (navbar)
const openRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/explore', element: <Images /> },
    { path: '/video-templates', element: <VideoTemplates /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
];

// Requires authentication
const protectedRoutes = [
    { path: '/profile', element: <Profile /> },
    { path: '/settings', element: <Settings /> },
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
                {publicRoutes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}

                {/* Routes with Navbar */}
                <Route element={<RootLayout />}>
                    {openRoutes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                        {protectedRoutes.map(({ path, element }) => (
                            <Route key={path} path={path} element={element} />
                        ))}
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin/*"
                        element={<AdminRoute><Admin /></AdminRoute>}
                    />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};