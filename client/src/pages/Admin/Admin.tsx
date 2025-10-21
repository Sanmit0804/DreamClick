import React from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger,
} from '@/components/ui/menubar';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    BarChart3, Settings, Users, Package, ShoppingCart, Home,
    ChevronRight, Plus, List, Edit,
} from 'lucide-react';
import ManageUser from './UserManagement/ManageUser';
import useDeviceType from '@/hooks/useDeviceType';
import EditUser from './UserManagement/SingleUser';

interface MenuItem {
    id: string;
    icon: React.ComponentType<any>;
    label: string;
    path?: string;
    subItems?: SubMenuItem[];
}
interface SubMenuItem {
    id: string;
    label: string;
    path: string;
    icon?: React.ComponentType<any>;
}

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        key={window.location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
        {children}
    </motion.div>
);

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const deviceType = useDeviceType();

    const menuItems: MenuItem[] = [
        { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/admin' },
        {
            id: 'orders',
            icon: ShoppingCart,
            label: 'Orders',
            subItems: [
                { id: 'order-list', label: 'All Orders', path: '/admin/orders', icon: List },
                { id: 'order-create', label: 'Create Order', path: '/admin/orders/create', icon: Plus },
                { id: 'order-pending', label: 'Pending Orders', path: '/admin/orders/pending', icon: Edit },
            ],
        },
        {
            id: 'products',
            icon: Package,
            label: 'Products',
            subItems: [
                { id: 'product-list', label: 'All Products', path: '/admin/products', icon: List },
                { id: 'product-create', label: 'Add Product', path: '/admin/products/create', icon: Plus },
                { id: 'product-categories', label: 'Categories', path: '/admin/products/categories', icon: Edit },
            ],
        },
        {
            id: 'customers',
            icon: Users,
            label: 'Customers',
            subItems: [
                { id: 'customer-list', label: 'All Customers', path: '/admin/customers', icon: List },
                { id: 'customer-create', label: 'Add Customer', path: '/admin/customers/create', icon: Plus },
                { id: 'customer-groups', label: 'Customer Groups', path: '/admin/customers/groups', icon: Users },
            ],
        },
        {
            id: 'analytics',
            icon: BarChart3,
            label: 'Analytics',
            subItems: [
                { id: 'sales-analytics', label: 'Sales Analytics', path: '/admin/analytics/sales', icon: BarChart3 },
                { id: 'customer-analytics', label: 'Customer Analytics', path: '/admin/analytics/customers', icon: Users },
                { id: 'product-analytics', label: 'Product Analytics', path: '/admin/analytics/products', icon: Package },
            ],
        },
        {
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            subItems: [
                { id: 'user-management', label: 'User Management', path: '/admin/users', icon: Users },
                { id: 'general-settings', label: 'General Settings', path: '/admin/settings/general', icon: Settings },
                { id: 'payment-settings', label: 'Payment Settings', path: '/admin/settings/payment', icon: ShoppingCart },
            ],
        },
    ];

    const handleMenuItemClick = (item: MenuItem) => item.path && navigate(item.path);
    const handleSubItemClick = (path: string) => navigate(path);
    const isMenuItemActive = (item: MenuItem): boolean => {
        if (item.path && location.pathname === item.path) return true;
        if (item.subItems?.some((sub) => location.pathname === sub.path)) return true;
        return false;
    };
    const generateBreadcrumbs = () => {
        const segs = location.pathname.split('/').filter(Boolean).slice(1);
        const crumbs = [{ label: 'Dashboard', href: '/admin', isCurrent: location.pathname === '/admin' }];
        let cur = '/admin';
        segs.forEach((s, i) => {
            cur += `/${s}`;
            const last = i === segs.length - 1;
            let label = s.charAt(0).toUpperCase() + s.slice(1);
            if (cur.match(/^\/admin\/users\/[^/]+$/)) label = 'User Detail';
            else {
                menuItems.forEach((it) => {
                    if (it.path === cur) label = it.label;
                    else if (it.subItems) {
                        const sub = it.subItems.find((su) => su.path === cur);
                        if (sub) label = sub.label;
                    }
                });
            }
            crumbs.push({ label, href: cur, isCurrent: last });
        });
        return crumbs;
    };
    const breadcrumbItems = generateBreadcrumbs();

    const isMobile = deviceType === 'mobile';
    const sidebarWidth = isMobile ? 256 : 256;

    return (
        <div className="flex h-screen overflow-hidden">
            <motion.aside
                className="bg-background border-r flex flex-col fixed md:relative z-20 h-full"
                initial={false}
                animate={{ x: 0, width: sidebarWidth }}
                exit={{ x: -sidebarWidth }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
                <Menubar className="flex-col h-full items-stretch border-none">
                    <div className="p-4 border-b">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-lg font-semibold"
                        >
                            {isMobile ? null : 'Admin Panel'}
                        </motion.h2>
                    </div>

                    <div className="flex-1 p-2">
                        {menuItems.map((item) => (
                            <MenubarMenu key={item.id}>
                                <MenubarTrigger
                                    className={`w-full mt-3 justify-between data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${isMenuItemActive(item) ? 'bg-accent text-accent-foreground' : ''}`}
                                    onClick={() => handleMenuItemClick(item)}
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {!isMobile && <span>{item.label}</span>}
                                    </motion.div>
                                    {item.subItems && !isMobile && <ChevronRight className="h-4 w-4" />}
                                </MenubarTrigger>

                                {item.subItems && (
                                    <MenubarContent side="right" align="start" className={`w-${isMobile ? '36' : '56'}`}>
                                        {item.subItems.map((sub, idx) => (
                                            <React.Fragment key={sub.id}>
                                                <MenubarItem
                                                    onClick={() => handleSubItemClick(sub.path)}
                                                    className={`flex items-center gap-2 cursor-pointer ${location.pathname === sub.path ? 'bg-accent' : ''}`}
                                                >
                                                    <motion.div
                                                        whileHover={{ x: 3 }}
                                                        whileTap={{ scale: 0.96 }}
                                                        className="flex items-center gap-2 w-full"
                                                    >
                                                        {sub.icon && <sub.icon className="h-4 w-4" />}
                                                        {!isMobile && <span>{sub.label}</span>}
                                                    </motion.div>
                                                </MenubarItem>
                                                {idx < item.subItems!.length - 1 && <MenubarSeparator />}
                                            </React.Fragment>
                                        ))}
                                    </MenubarContent>
                                )}
                            </MenubarMenu>
                        ))}
                    </div>
                </Menubar>
            </motion.aside>

            <div className="flex-1 flex flex-col">
                <div className="p-6 pb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <AnimatePresence mode="popLayout">
                                {breadcrumbItems.map((item, idx) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center"
                                    >
                                        <BreadcrumbItem>
                                            {item.isCurrent ? (
                                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link to={item.href}>{item.label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {idx < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex-1 p-6 pt-2 overflow-auto">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                            <Route path="/orders" element={<PageTransition><OrdersList /></PageTransition>} />
                            <Route path="/orders/create" element={<PageTransition><CreateOrder /></PageTransition>} />
                            <Route path="/orders/pending" element={<PageTransition><PendingOrders /></PageTransition>} />
                            <Route path="/products" element={<PageTransition><ProductsList /></PageTransition>} />
                            <Route path="/products/create" element={<PageTransition><CreateProduct /></PageTransition>} />
                            <Route path="/products/categories" element={<PageTransition><ProductCategories /></PageTransition>} />
                            <Route path="/customers" element={<PageTransition><CustomersList /></PageTransition>} />
                            <Route path="/customers/create" element={<PageTransition><CreateCustomer /></PageTransition>} />
                            <Route path="/customers/groups" element={<PageTransition><CustomerGroups /></PageTransition>} />
                            <Route path="/analytics/sales" element={<PageTransition><SalesAnalytics /></PageTransition>} />
                            <Route path="/analytics/customers" element={<PageTransition><CustomerAnalytics /></PageTransition>} />
                            <Route path="/analytics/products" element={<PageTransition><ProductAnalytics /></PageTransition>} />
                            <Route path="/settings/general" element={<PageTransition><GeneralSettings /></PageTransition>} />
                            <Route path="/users" element={<PageTransition><ManageUser /></PageTransition>} />
                            <Route path="/users/:id" element={<PageTransition><EditUser /></PageTransition>} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => (
    <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { title: 'Quick Stats', text: 'Welcome to your admin dashboard' },
                { title: 'Recent Activity', text: 'No recent activity' },
                { title: 'Notifications', text: 'No new notifications' },
            ].map((card, i) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-card border rounded-lg p-6"
                >
                    <h3 className="font-semibold mb-2">{card.title}</h3>
                    <p>{card.text}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

const OrdersList = () => <div><h1 className="text-3xl font-bold mb-8">All Orders</h1><p>Order list content...</p></div>;
const CreateOrder = () => <div><h1 className="text-3xl font-bold mb-8">Create Order</h1><p>Create order form...</p></div>;
const PendingOrders = () => <div><h1 className="text-3xl font-bold mb-8">Pending Orders</h1><p>Pending orders content...</p></div>;
const ProductsList = () => <div><h1 className="text-3xl font-bold mb-8">All Products</h1><p>Product list content...</p></div>;
const CreateProduct = () => <div><h1 className="text-3xl font-bold mb-8">Add Product</h1><p>Create product form...</p></div>;
const ProductCategories = () => <div><h1 className="text-3xl font-bold mb-8">Product Categories</h1><p>Categories management...</p></div>;
const CustomersList = () => <div><h1 className="text-3xl font-bold mb-8">All Customers</h1><p>Customer list content...</p></div>;
const CreateCustomer = () => <div><h1 className="text-3xl font-bold mb-8">Add Customer</h1><p>Create customer form...</p></div>;
const CustomerGroups = () => <div><h1 className="text-3xl font-bold mb-8">Customer Groups</h1><p>Customer groups management...</p></div>;
const SalesAnalytics = () => <div><h1 className="text-3xl font-bold mb-8">Sales Analytics</h1><p>Sales charts and data...</p></div>;
const CustomerAnalytics = () => <div><h1 className="text-3xl font-bold mb-8">Customer Analytics</h1><p>Customer insights...</p></div>;
const ProductAnalytics = () => <div><h1 className="text-3xl font-bold mb-8">Product Analytics</h1><p>Product performance...</p></div>;
const GeneralSettings = () => <div><h1 className="text-3xl font-bold mb-8">General Settings</h1><p>General configuration...</p></div>;

export default Admin;