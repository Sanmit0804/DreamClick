const express = require('express');
const router = express.Router();

const UserRouter = require('./user.route');
const TemplateRouter = require('./template.route');

const routes = [
    {
        path: '/users',
        router: UserRouter,
    },
    {
        path: '/templates',
        router: TemplateRouter,
    },
];

routes.forEach(({ path, router: routeHandler }) => {
    router.use(path, routeHandler);
});

module.exports = router;
