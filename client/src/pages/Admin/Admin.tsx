import React from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    BarChart3,
    Settings,
    Users,
    Package,
    ShoppingCart,
    Home,
    ChevronRight,
    Plus,
    List,
    Edit,
} from 'lucide-react';
import ManageUser from './UserManagement/ManageUser';
import useDeviceType from '@/hooks/useDeviceType';
import EditUser from './UserManagement/SingleUser';

// Types for our menu structure
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

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const deviceType = useDeviceType();

    // Dynamic menu configuration
    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            icon: Home,
            label: 'Dashboard',
            path: '/admin',
        },
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

    // Handle menu item click
    const handleMenuItemClick = (item: MenuItem) => {
        if (item.path) {
            navigate(item.path);
        }
    };

    // Handle submenu item click
    const handleSubItemClick = (path: string) => {
        navigate(path);
    };

    // Check if a menu item is active
    const isMenuItemActive = (item: MenuItem): boolean => {
        if (item.path && location.pathname === item.path) return true;
        if (item.subItems?.some((subItem) => location.pathname === subItem.path)) return true;
        return false;
    };

    // Generate breadcrumb items based on current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        // Remove 'admin' from the beginning since we're already in admin context
        const adminSegments = pathSegments.slice(1);
        const breadcrumbs = [
            {
                label: 'Dashboard',
                href: '/admin',
                isCurrent: location.pathname === '/admin'
            }
        ];
        let currentPath = '/admin';

        adminSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === adminSegments.length - 1;
            let label = segment.charAt(0).toUpperCase() + segment.slice(1);

            // Handle the /users/edit/:id route specifically
            if (currentPath.match(/^\/admin\/users\/[^/]+$/)) {
                label = 'User Detail';
            } else {
                // Try to find a better label from our menu configuration
                menuItems.forEach(item => {
                    if (item.path === currentPath) {
                        label = item.label;
                    } else if (item.subItems) {
                        const subItem = item.subItems.find(sub => sub.path === currentPath);
                        if (subItem) {
                            label = subItem.label;
                        }
                    }
                });
            }

            breadcrumbs.push({
                label,
                href: currentPath,
                isCurrent: isLast
            });
        });
        return breadcrumbs;
    };

    const breadcrumbItems = generateBreadcrumbs();

    return (
        <div className="flex">
            {/* Vertical Menubar Sidebar */}
            <div className="w-64 bg-background border-r">
                <Menubar className="flex-col h-full items-stretch border-none">
                    {/* Logo/Header */}
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">
                            {deviceType !== 'mobile' ? 'Admin Panel' : null}
                        </h2>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 p-2">
                        {menuItems.map((item) => (
                            <MenubarMenu key={item.id}>
                                <MenubarTrigger
                                    className={`w-full mt-3 justify-between data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${isMenuItemActive(item)
                                        ? 'bg-accent text-accent-foreground'
                                        : ''
                                        }`}
                                    onClick={() => handleMenuItemClick(item)}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon className="h-5 w-5" />
                                        {deviceType !== 'mobile' && <span>{item.label}</span>}
                                    </div>
                                    {item.subItems && deviceType !== 'mobile' && (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </MenubarTrigger>

                                {item.subItems && (
                                    <MenubarContent
                                        side="right"
                                        align="start"
                                        className={`w-${deviceType === 'mobile' ? '36' : '56'}`}
                                    >
                                        {item.subItems.map((subItem, index) => (
                                            <React.Fragment key={subItem.id}>
                                                <MenubarItem
                                                    onClick={() => handleSubItemClick(subItem.path)}
                                                    className={`flex items-center gap-2 cursor-pointer ${location.pathname === subItem.path ? 'bg-accent' : ''
                                                        }`}
                                                >
                                                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                    {deviceType !== 'mobile' && <span>{subItem.label}</span>}
                                                </MenubarItem>
                                                {index < item.subItems!.length - 1 && <MenubarSeparator />}
                                            </React.Fragment>
                                        ))}
                                    </MenubarContent>
                                )}
                            </MenubarMenu>
                        ))}
                    </div>
                </Menubar>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Breadcrumb Navigation */}
                <div className="p-6 pb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbItems.map((item, index) => (
                                <React.Fragment key={item.href}>
                                    <BreadcrumbItem>
                                        {item.isCurrent ? (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.href}>{item.label}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Page Content */}
                <div className="flex-1 p-6 pt-2">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/orders" element={<OrdersList />} />
                        <Route path="/orders/create" element={<CreateOrder />} />
                        <Route path="/orders/pending" element={<PendingOrders />} />
                        <Route path="/products" element={<ProductsList />} />
                        <Route path="/products/create" element={<CreateProduct />} />
                        <Route path="/products/categories" element={<ProductCategories />} />
                        <Route path="/customers" element={<CustomersList />} />
                        <Route path="/customers/create" element={<CreateCustomer />} />
                        <Route path="/customers/groups" element={<CustomerGroups />} />
                        <Route path="/analytics/sales" element={<SalesAnalytics />} />
                        <Route path="/analytics/customers" element={<CustomerAnalytics />} />
                        <Route path="/analytics/products" element={<ProductAnalytics />} />
                        <Route path="/settings/general" element={<GeneralSettings />} />
                        <Route path="/users" element={<ManageUser />} />
                        <Route path="/users/:id" element={<EditUser />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Example page components (unchanged)
const Dashboard = () => (
    <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <p>Welcome to your admin dashboard</p>
            </div>
            <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <p>No recent activity</p>
            </div>
            <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <p>No new notifications</p>
            </div>
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
const PaymentSettings = () => <div><h1 className="text-3xl font-bold mb-8">Payment Settings</h1><p>Payment configuration...</p></div>;

export default Admin;