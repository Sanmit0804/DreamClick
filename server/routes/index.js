const express = require('express');
const router = express.Router();

const UserRouter = require('./user.route');
const TemplateRouter = require('./template.route');
const AdminRouter = require('./admin.route');
const SettingsRouter = require('./setting.routes');

const routes = [
    {
        path: '/users',
        router: UserRouter,
    },
    {
        path: '/templates',
        router: TemplateRouter,
    },
    {
        path: '/admin',
        router: AdminRouter,
    },
    {
        path: '/settings',
        router: SettingsRouter,
    },
];

routes.forEach(({ path, router: routeHandler }) => {
    router.use(path, routeHandler);
});

module.exports = router;
