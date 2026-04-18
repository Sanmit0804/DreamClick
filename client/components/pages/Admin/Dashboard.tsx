'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createColumnHelper } from '@tanstack/react-table';
import {
    Users, Film, ShoppingCart, TrendingUp, TrendingDown,
    IndianRupee, BarChart3, Activity, Youtube, CheckCircle2,
    XCircle, Clock, Loader2, Star, Crown, User,
    ArrowUpRight, Zap, Package, RefreshCw, AlertCircle,
} from 'lucide-react';
import RenderTable from '@/components/RenderTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import config from '@/config/config';
import axios from 'axios';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((cfg) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

const fetchAdminStats = async () => {
    const res = await api.get('/api/admin/stats');
    return res.data.data;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface GrowthPoint { date: string; count: number; }
interface RevenuePoint { date: string; amount: number; }

interface AdminStats {
    kpis: {
        totalUsers: number;
        activeUsers: number;
        adminUsers: number;
        creatorUsers: number;
        endUsers: number;
        newUsersThisMonth: number;
        totalTemplates: number;
        freeTemplates: number;
        paidTemplates: number;
        newTemplatesThisMonth: number;
        totalRevenue: number;
        thisMonthRevenue: number;
        totalPurchases: number;
    };
    growth: {
        users: GrowthPoint[];
        templates: GrowthPoint[];
        revenue: RevenuePoint[];
    };
    categoryBreakdown: { category: string; count: number }[];
    recentUsers: { name: string; email: string; role: string; createdAt: string; isActive: boolean }[];
    recentTemplates: { _id: string; templateName: string; templateCategory: string; templatePrice: number; createdAt: string; uploaderName: string | null }[];
    recentPurchases: { userName: string; userEmail: string; amount: number; currency: string; purchasedAt: string; status: string }[];
    recentYoutubeLogs: { _id: string; templateName: string; status: string; triggeredBy: string; retries: number; youtubeVideoUrl: string | null; createdAt: string }[];
}

// ─── Sparkline SVG Chart ──────────────────────────────────────────────────────
const Sparkline: React.FC<{
    data: number[];
    color: string;
    height?: number;
    width?: number;
    filled?: boolean;
}> = ({ data, color, height = 48, width = 120, filled = true }) => {
    if (!data || data.length < 2) {
        return <div style={{ width, height }} className="flex items-center justify-center text-xs text-muted-foreground">—</div>;
    }
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((v - min) / range) * (height - 8) - 4,
    }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {filled && (
                <path d={fillPath} fill={`url(#grad-${color.replace('#', '')})`} />
            )}
            <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Last dot */}
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
        </svg>
    );
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const MiniBarChart: React.FC<{
    data: { label: string; count: number }[];
    color: string;
    height?: number;
}> = ({ data, color, height = 80 }) => {
    if (!data || data.length === 0) return <p className="text-xs text-muted-foreground text-center py-4">No data</p>;
    const max = Math.max(...data.map((d) => d.count)) || 1;
    return (
        <div className="flex items-end gap-1.5 w-full" style={{ height }}>
            {data.map((d) => {
                const barHeight = Math.max(4, (d.count / max) * (height - 20));
                return (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5 group" title={`${d.label}: ${d.count}`}>
                        <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight">{d.count}</span>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: barHeight }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                            style={{ backgroundColor: color, borderRadius: 3, width: '100%' }}
                        />
                        <span className="text-[9px] text-muted-foreground truncate w-full text-center"
                            style={{ maxWidth: 40 }}>{d.label.slice(0, 4)}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    sparkData?: number[];
    sparkColor?: string;
    accent?: string;
    delay?: number;
}> = ({ label, value, sub, icon, trend, sparkData, sparkColor = '#6366f1', accent = 'rgba(99,102,241,0.1)', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden bg-card border rounded-xl p-5 flex flex-col gap-3 shadow-sm"
    >
        {/* Accent glow top-right */}
        <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none"
            style={{ background: accent }}
        />
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
            <div className="p-2 rounded-lg" style={{ background: accent }}>
                {icon}
            </div>
        </div>
        <div>
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {sub && (
                <div className="flex items-center gap-1 mt-1">
                    {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span className={`text-xs ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>{sub}</span>
                </div>
            )}
        </div>
        {sparkData && sparkData.length > 1 && (
            <div className="mt-auto pt-1">
                <Sparkline data={sparkData} color={sparkColor} height={36} width={200} />
            </div>
        )}
    </motion.div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
    </div>
);

// ─── YouTube Status Badge ─────────────────────────────────────────────────────
const YtStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
        success: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50', icon: <CheckCircle2 className="h-3 w-3" /> },
        failed: { color: 'bg-red-500/10 text-red-600 border-red-200/50', icon: <XCircle className="h-3 w-3" /> },
        processing: { color: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
        pending: { color: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: <Clock className="h-3 w-3" /> },
    };
    const cfg = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
            {cfg.icon} {status}
        </span>
    );
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const map: Record<string, string> = {
        admin: 'bg-violet-500/10 text-violet-600 border-violet-200/50',
        content_creator: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
        end_user: 'bg-zinc-500/10 text-zinc-600 border-zinc-200/50',
    };
    const icons: Record<string, React.ReactNode> = {
        admin: <Crown className="h-3 w-3" />,
        content_creator: <Star className="h-3 w-3" />,
        end_user: <User className="h-3 w-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${map[role] || map.end_user}`}>
            {icons[role] || <User className="h-3 w-3" />}
            {role.replace('_', ' ')}
        </span>
    );
};

// ─── Growth Chart Card ────────────────────────────────────────────────────────
const GrowthChartCard: React.FC<{
    title: string;
    sub: string;
    data: GrowthPoint[];
    color: string;
    icon: React.ReactNode;
    delay?: number;
}> = ({ title, sub, data, color, icon, delay = 0 }) => {
    const values = useMemo(() => {
        // Fill last 14 days with zeros if missing
        const days: { date: string; count: number }[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = data.find((p) => p.date === key);
            days.push({ date: key, count: found ? found.count : 0 });
        }
        return days;
    }, [data]);

    const total = useMemo(() => values.reduce((s, d) => s + d.count, 0), [values]);
    const sparkArr = useMemo(() => values.map((v) => v.count), [values]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            className="bg-card border rounded-xl p-5 shadow-sm"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="p-1.5 rounded-lg" style={{ background: `${color}20` }}>
                            {icon}
                        </span>
                        <span className="font-semibold text-sm">{title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-9">{sub}</p>
                </div>
                <div className="text-right">
                    <span className="text-xl font-bold">{total}</span>
                    <p className="text-xs text-muted-foreground">last 14 days</p>
                </div>
            </div>
            <Sparkline data={sparkArr} color={color} height={56} width={320} filled />
            {/* Day labels */}
            <div className="flex justify-between mt-1">
                {[values[0], values[6], values[13]].map((v) => (
                    <span key={v.date} className="text-[10px] text-muted-foreground">
                        {new Date(v.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

// ─── Revenue Chart Card ───────────────────────────────────────────────────────
const RevenueChartCard: React.FC<{
    data: RevenuePoint[];
    totalRevenue: number;
    thisMonthRevenue: number;
    delay?: number;
}> = ({ data, totalRevenue, thisMonthRevenue, delay = 0 }) => {
    const values = useMemo(() => {
        const days: { date: string; amount: number }[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = data.find((p) => p.date === key);
            // Amount is in paise, convert to INR
            days.push({ date: key, amount: found ? found.amount / 100 : 0 });
        }
        return days;
    }, [data]);

    const sparkArr = useMemo(() => values.map((v) => v.amount), [values]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: 'easeOut' }}
            className="bg-card border rounded-xl p-5 shadow-sm col-span-full lg:col-span-2"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10">
                        <IndianRupee className="h-4 w-4 text-emerald-500" />
                    </span>
                    <div>
                        <span className="font-semibold text-sm">Revenue Trend</span>
                        <p className="text-xs text-muted-foreground">Last 14 days · Razorpay captured payments</p>
                    </div>
                </div>
                <div className="flex gap-4 text-right">
                    <div>
                        <p className="text-xs text-muted-foreground">All Time</p>
                        <p className="text-lg font-bold text-emerald-500">₹{(totalRevenue / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">This Month</p>
                        <p className="text-lg font-bold">₹{(thisMonthRevenue / 100).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
            <Sparkline data={sparkArr} color="#10b981" height={64} width={640} filled />
            <div className="flex justify-between mt-1">
                {[values[0], values[6], values[13]].map((v) => (
                    <span key={v.date} className="text-[10px] text-muted-foreground">
                        {new Date(v.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl h-32" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl h-40" />
            ))}
        </div>
        <div className="bg-card border rounded-xl h-64" />
    </div>
);

// ─── Empty / Error States ─────────────────────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <div className="opacity-30">{icon}</div>
        <p className="text-sm">{message}</p>
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
    const {
        data: stats,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery<AdminStats>({
        queryKey: ['admin-stats'],
        queryFn: fetchAdminStats,
        staleTime: 2 * 60 * 1000,   // 2 min
        refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
    });

    // ── Recent Users table columns ─────────────────────────────────────────────
    type RecentUser = AdminStats['recentUsers'][number];
    const userColHelper = createColumnHelper<RecentUser>();
    const userColumns = useMemo(() => [
        userColHelper.accessor('name', {
            header: 'Name',
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
            meta: { headerClassName: 'text-left pl-4', className: 'pl-4' },
        }),
        userColHelper.accessor('email', {
            header: 'Email',
            cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue()}</span>,
            meta: { headerClassName: 'text-left', className: 'hidden md:table-cell' },
        }),
        userColHelper.accessor('role', {
            header: 'Role',
            cell: (info) => <RoleBadge role={info.getValue()} />,
            meta: { headerClassName: 'text-center', className: 'text-center' },
        }),
        userColHelper.accessor('createdAt', {
            header: 'Joined',
            cell: (info) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(info.getValue()), config.DATE_FORMAT)}
                </span>
            ),
            meta: { headerClassName: 'text-right', className: 'text-right hidden sm:table-cell' },
        }),
    ], [userColHelper]);

    // ── Recent Templates table columns ─────────────────────────────────────────
    type RecentTemplate = AdminStats['recentTemplates'][number];
    const tmplColHelper = createColumnHelper<RecentTemplate>();
    const tmplColumns = useMemo(() => [
        tmplColHelper.accessor('templateName', {
            header: 'Template',
            cell: (info) => <span className="font-medium line-clamp-1">{info.getValue()}</span>,
            meta: { headerClassName: 'text-left pl-4', className: 'pl-4 max-w-[180px]' },
        }),
        tmplColHelper.accessor('templateCategory', {
            header: 'Category',
            cell: (info) => <Badge variant="outline" className="text-xs">{info.getValue() || 'General'}</Badge>,
            meta: { headerClassName: 'text-center hidden sm:table-cell', className: 'text-center hidden sm:table-cell' },
        }),
        tmplColHelper.accessor('templatePrice', {
            header: 'Price',
            cell: (info) => (
                <span className={`font-semibold text-sm ${info.getValue() === 0 ? 'text-emerald-500' : 'text-primary'}`}>
                    {info.getValue() === 0 ? 'Free' : `₹${info.getValue()}`}
                </span>
            ),
            meta: { headerClassName: 'text-center', className: 'text-center' },
        }),
        tmplColHelper.accessor('createdAt', {
            header: 'Added',
            cell: (info) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(info.getValue()), config.DATE_FORMAT)}
                </span>
            ),
            meta: { headerClassName: 'text-right hidden md:table-cell', className: 'text-right hidden md:table-cell' },
        }),
    ], [tmplColHelper]);

    // ── Recent Purchases table columns ─────────────────────────────────────────
    type Purchase = AdminStats['recentPurchases'][number];
    const purchaseColHelper = createColumnHelper<Purchase>();
    const purchaseColumns = useMemo(() => [
        purchaseColHelper.accessor('userName', {
            header: 'Customer',
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
            meta: { headerClassName: 'text-left pl-4', className: 'pl-4' },
        }),
        purchaseColHelper.accessor('amount', {
            header: 'Amount',
            cell: (info) => (
                <span className="font-semibold text-emerald-500">
                    ₹{(info.getValue() / 100).toLocaleString('en-IN')}
                </span>
            ),
            meta: { headerClassName: 'text-center', className: 'text-center' },
        }),
        purchaseColHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <Badge variant={info.getValue() === 'captured' ? 'default' : 'outline'} className="text-xs">
                    {info.getValue()}
                </Badge>
            ),
            meta: { headerClassName: 'text-center', className: 'text-center' },
        }),
        purchaseColHelper.accessor('purchasedAt', {
            header: 'Date',
            cell: (info) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(info.getValue()), config.DATE_FORMAT)}
                </span>
            ),
            meta: { headerClassName: 'text-right hidden sm:table-cell', className: 'text-right hidden sm:table-cell' },
        }),
    ], [purchaseColHelper]);

    if (isLoading) return <DashboardSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle className="h-12 w-12 text-destructive/50" />
                <p className="text-muted-foreground text-sm">Failed to load dashboard analytics.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Retry
                </Button>
            </div>
        );
    }

    const k = stats!.kpis;
    const g = stats!.growth;

    // Build spark arrays for KPI cards from last 14 days of growth data
    const today = new Date();
    const userSpark = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (13 - i));
        const key = d.toISOString().slice(0, 10);
        return g.users.find((p) => p.date === key)?.count ?? 0;
    });
    const tmplSpark = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (13 - i));
        const key = d.toISOString().slice(0, 10);
        return g.templates.find((p) => p.date === key)?.count ?? 0;
    });

    return (
        <div className="space-y-7">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics Hub</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">System-wide overview · Live data</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* ── KPI Cards ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total Users"
                    value={k.totalUsers.toLocaleString()}
                    sub={`+${k.newUsersThisMonth} this month`}
                    trend="up"
                    icon={<Users className="h-4 w-4 text-violet-500" />}
                    sparkData={userSpark}
                    sparkColor="#8b5cf6"
                    accent="rgba(139,92,246,0.1)"
                    delay={0}
                />
                <KpiCard
                    label="Total Templates"
                    value={k.totalTemplates.toLocaleString()}
                    sub={`+${k.newTemplatesThisMonth} this month`}
                    trend="up"
                    icon={<Film className="h-4 w-4 text-blue-500" />}
                    sparkData={tmplSpark}
                    sparkColor="#3b82f6"
                    accent="rgba(59,130,246,0.1)"
                    delay={0.06}
                />
                <KpiCard
                    label="Total Revenue"
                    value={`₹${(k.totalRevenue / 100).toLocaleString('en-IN')}`}
                    sub={`₹${(k.thisMonthRevenue / 100).toLocaleString('en-IN')} this month`}
                    trend={k.thisMonthRevenue > 0 ? 'up' : 'neutral'}
                    icon={<IndianRupee className="h-4 w-4 text-emerald-500" />}
                    accent="rgba(16,185,129,0.1)"
                    delay={0.12}
                />
                <KpiCard
                    label="Total Purchases"
                    value={k.totalPurchases.toLocaleString()}
                    sub={`${k.paidTemplates} paid · ${k.freeTemplates} free templates`}
                    icon={<ShoppingCart className="h-4 w-4 text-amber-500" />}
                    accent="rgba(245,158,11,0.1)"
                    delay={0.18}
                />
            </div>

            {/* ── Secondary KPIs ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Active', value: k.activeUsers, icon: <Activity className="h-3.5 w-3.5 text-emerald-500" />, color: 'text-emerald-500' },
                    { label: 'Admins', value: k.adminUsers, icon: <Crown className="h-3.5 w-3.5 text-violet-500" />, color: 'text-violet-500' },
                    { label: 'Creators', value: k.creatorUsers, icon: <Star className="h-3.5 w-3.5 text-blue-500" />, color: 'text-blue-500' },
                    { label: 'End Users', value: k.endUsers, icon: <User className="h-3.5 w-3.5 text-zinc-500" />, color: 'text-zinc-500' },
                    { label: 'Paid Templates', value: k.paidTemplates, icon: <Package className="h-3.5 w-3.5 text-amber-500" />, color: 'text-amber-500' },
                    { label: 'Free Templates', value: k.freeTemplates, icon: <Zap className="h-3.5 w-3.5 text-sky-500" />, color: 'text-sky-500' },
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                        className="bg-card border rounded-lg p-3 flex items-center gap-3"
                    >
                        <div className="p-1.5 rounded bg-muted">{item.icon}</div>
                        <div>
                            <p className={`text-lg font-bold leading-tight ${item.color}`}>{item.value}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">{item.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Growth Charts ─────────────────────────────────────────────── */}
            <div>
                <SectionHeader
                    icon={<BarChart3 className="h-4 w-4" />}
                    title="Growth Trends"
                    sub="14-day activity overview"
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <GrowthChartCard
                        title="User Growth"
                        sub="New signups per day"
                        data={g.users}
                        color="#8b5cf6"
                        icon={<Users className="h-4 w-4 text-violet-500" />}
                        delay={0.2}
                    />
                    <GrowthChartCard
                        title="Template Uploads"
                        sub="New templates per day"
                        data={g.templates}
                        color="#3b82f6"
                        icon={<Film className="h-4 w-4 text-blue-500" />}
                        delay={0.26}
                    />
                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
                        className="bg-card border rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="p-1.5 rounded-lg bg-amber-500/10">
                                <Package className="h-4 w-4 text-amber-500" />
                            </span>
                            <div>
                                <span className="font-semibold text-sm">Categories</span>
                                <p className="text-xs text-muted-foreground">Template distribution by type</p>
                            </div>
                        </div>
                        {stats!.categoryBreakdown.length > 0 ? (
                            <MiniBarChart
                                data={stats!.categoryBreakdown.map((c) => ({ label: c.category, count: c.count }))}
                                color="#f59e0b"
                                height={90}
                            />
                        ) : (
                            <EmptyState icon={<Package className="h-8 w-8" />} message="No categories yet" />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ── Revenue Chart ─────────────────────────────────────────────── */}
            <div>
                <SectionHeader
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="Revenue Analytics"
                    sub="Captured Razorpay payments · amounts in INR"
                />
                <div className="grid lg:grid-cols-2 gap-4">
                    <RevenueChartCard
                        data={g.revenue}
                        totalRevenue={k.totalRevenue}
                        thisMonthRevenue={k.thisMonthRevenue}
                        delay={0.24}
                    />
                    {/* Revenue Role Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                        className="bg-card border rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="p-1.5 rounded-lg bg-emerald-500/10">
                                <Users className="h-4 w-4 text-emerald-500" />
                            </span>
                            <div>
                                <span className="font-semibold text-sm">User Breakdown</span>
                                <p className="text-xs text-muted-foreground">Distribution by role</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'End Users', value: k.endUsers, total: k.totalUsers, color: '#6366f1' },
                                { label: 'Content Creators', value: k.creatorUsers, total: k.totalUsers, color: '#3b82f6' },
                                { label: 'Admins', value: k.adminUsers, total: k.totalUsers, color: '#8b5cf6' },
                            ].map((item) => {
                                const pct = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : '0';
                                return (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">{item.label}</span>
                                            <span className="font-medium">{item.value} <span className="text-muted-foreground">({pct}%)</span></span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-3">
                            <div className="bg-muted/40 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-emerald-500">{k.activeUsers}</p>
                                <p className="text-[11px] text-muted-foreground">Active Users</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold">{k.newUsersThisMonth}</p>
                                <p className="text-[11px] text-muted-foreground">New This Month</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Recent Activity Tables ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="bg-card border rounded-xl p-5 shadow-sm"
                >
                    <SectionHeader
                        icon={<Users className="h-4 w-4" />}
                        title="Recent Users"
                        sub="Latest 8 registrations"
                    />
                    {stats!.recentUsers.length > 0 ? (
                        <RenderTable
                            columns={userColumns}
                            data={stats!.recentUsers}
                            pagination={false}
                            emptyMessage="No users yet."
                        />
                    ) : (
                        <EmptyState icon={<Users className="h-8 w-8" />} message="No users yet" />
                    )}
                </motion.div>

                {/* Recent Templates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-card border rounded-xl p-5 shadow-sm"
                >
                    <SectionHeader
                        icon={<Film className="h-4 w-4" />}
                        title="Recent Templates"
                        sub="Latest 8 uploads"
                    />
                    {stats!.recentTemplates.length > 0 ? (
                        <RenderTable
                            columns={tmplColumns}
                            data={stats!.recentTemplates}
                            pagination={false}
                            emptyMessage="No templates yet."
                        />
                    ) : (
                        <EmptyState icon={<Film className="h-8 w-8" />} message="No templates yet" />
                    )}
                </motion.div>
            </div>

            {/* ── Purchases + YouTube Logs ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Purchases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                    className="bg-card border rounded-xl p-5 shadow-sm"
                >
                    <SectionHeader
                        icon={<ShoppingCart className="h-4 w-4" />}
                        title="Recent Purchases"
                        sub="Latest 10 captured payments"
                    />
                    {stats!.recentPurchases.length > 0 ? (
                        <RenderTable
                            columns={purchaseColumns}
                            data={stats!.recentPurchases}
                            pagination={false}
                            emptyMessage="No purchases yet."
                        />
                    ) : (
                        <EmptyState icon={<ShoppingCart className="h-8 w-8" />} message="No purchases yet" />
                    )}
                </motion.div>

                {/* YouTube Upload Logs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-card border rounded-xl p-5 shadow-sm"
                >
                    <SectionHeader
                        icon={<Youtube className="h-4 w-4" />}
                        title="YouTube Upload Logs"
                        sub="Latest 10 upload attempts"
                    />
                    {stats!.recentYoutubeLogs.length > 0 ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {stats!.recentYoutubeLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <YtStatusBadge status={log.status} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{log.templateName || 'Unnamed'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.triggeredBy === 'auto' ? '⚡ Auto' : '👆 Manual'} ·{' '}
                                            {format(new Date(log.createdAt), config.DATE_FORMAT)}
                                            {log.retries > 0 && ` · ${log.retries} retries`}
                                        </p>
                                    </div>
                                    {log.youtubeVideoUrl && (
                                        <a
                                            href={log.youtubeVideoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                                            title="View on YouTube"
                                        >
                                            <ArrowUpRight className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={<Youtube className="h-8 w-8" />} message="No YouTube upload logs yet" />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
