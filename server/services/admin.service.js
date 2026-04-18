const User = require('../models/user.model');
const TemplateModel = require('../models/template.model');
const YoutubeUploadLog = require('../models/youtubeUploadLog.model');

/**
 * Fetches and aggregates all admin dashboard analytics.
 * All heavy DB calls are run in parallel via Promise.all for optimal performance.
 */
const getAdminStats = async () => {
    const now = new Date();
    const startOf30DaysAgo = new Date(now);
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);
    startOf30DaysAgo.setHours(0, 0, 0, 0);

    const [
        users,
        templates,
        recentYoutubeLogs,
        userGrowthRaw,
        templateGrowthRaw,
    ] = await Promise.all([
        User.find({}, {
            name: 1, email: 1, role: 1, createdAt: 1, isActive: 1,
            'purchases.amount': 1, 'purchases.paymentStatus': 1, 'purchases.purchasedAt': 1,
        }).lean(),

        TemplateModel.find({}, {
            templateName: 1, templateCategory: 1, templatePrice: 1, createdAt: 1, userId: 1,
        }).populate('userId', 'name').lean(),

        YoutubeUploadLog.find({}).sort({ createdAt: -1 }).limit(10).lean(),

        User.aggregate([
            { $match: { createdAt: { $gte: startOf30DaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        TemplateModel.aggregate([
            { $match: { createdAt: { $gte: startOf30DaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    // ── KPIs ────────────────────────────────────────────────────────────────────
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers        = users.length;
    const activeUsers       = users.filter((u) => u.isActive !== false).length;
    const adminUsers        = users.filter((u) => u.role === 'admin').length;
    const creatorUsers      = users.filter((u) => u.role === 'content_creator').length;
    const endUsers          = users.filter((u) => u.role === 'end_user').length;
    const newUsersThisMonth = users.filter((u) => new Date(u.createdAt) >= thisMonthStart).length;

    const totalTemplates        = templates.length;
    const freeTemplates         = templates.filter((t) => t.templatePrice === 0).length;
    const paidTemplates         = totalTemplates - freeTemplates;
    const newTemplatesThisMonth = templates.filter((t) => new Date(t.createdAt) >= thisMonthStart).length;

    // ── Revenue (Razorpay amounts are in paise) ─────────────────────────────────
    let totalRevenue     = 0;
    let thisMonthRevenue = 0;
    let totalPurchases   = 0;
    const recentPurchases = [];
    const revenueTrendMap = {};

    users.forEach((user) => {
        (user.purchases || []).forEach((p) => {
            if (p.paymentStatus !== 'captured') return;
            const amount = p.amount || 0;
            totalRevenue += amount;
            totalPurchases++;

            if (new Date(p.purchasedAt) >= thisMonthStart) {
                thisMonthRevenue += amount;
            }

            recentPurchases.push({
                userName:    user.name,
                userEmail:   user.email,
                amount,
                currency:    'INR',
                purchasedAt: p.purchasedAt,
                status:      p.paymentStatus,
            });

            if (new Date(p.purchasedAt) >= startOf30DaysAgo) {
                const day = new Date(p.purchasedAt).toISOString().slice(0, 10);
                revenueTrendMap[day] = (revenueTrendMap[day] || 0) + amount;
            }
        });
    });

    recentPurchases.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    // ── Category breakdown ───────────────────────────────────────────────────────
    const categoryMap = {};
    templates.forEach((t) => {
        const cat = t.templateCategory || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    return {
        kpis: {
            totalUsers,
            activeUsers,
            adminUsers,
            creatorUsers,
            endUsers,
            newUsersThisMonth,
            totalTemplates,
            freeTemplates,
            paidTemplates,
            newTemplatesThisMonth,
            totalRevenue,
            thisMonthRevenue,
            totalPurchases,
        },
        growth: {
            users:     userGrowthRaw.map((d) => ({ date: d._id, count: d.count })),
            templates: templateGrowthRaw.map((d) => ({ date: d._id, count: d.count })),
            revenue:   Object.entries(revenueTrendMap)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a, b) => a.date.localeCompare(b.date)),
        },
        categoryBreakdown: Object.entries(categoryMap)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6),
        recentUsers: [...users]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
            .map(({ name, email, role, createdAt, isActive }) => ({ name, email, role, createdAt, isActive })),
        recentTemplates: [...templates]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
            .map((t) => ({
                _id:              t._id,
                templateName:     t.templateName,
                templateCategory: t.templateCategory,
                templatePrice:    t.templatePrice,
                createdAt:        t.createdAt,
                uploaderName:     typeof t.userId === 'object' ? t.userId?.name : null,
            })),
        recentPurchases: recentPurchases.slice(0, 10),
        recentYoutubeLogs: recentYoutubeLogs.map((l) => ({
            _id:            l._id,
            templateName:   l.templateName,
            status:         l.status,
            triggeredBy:    l.triggeredBy,
            retries:        l.retries,
            youtubeVideoUrl: l.youtubeVideoUrl,
            createdAt:      l.createdAt,
        })),
    };
};

module.exports = { getAdminStats };
