const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const studentRoute = require('./student.route');
const schoolRoute = require('./school.route');
const feeRoute = require('./fee.route');
const paymentRoute = require('./payment.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/student',
    route: studentRoute,
  },
  {
    path: '/school',
    route: schoolRoute,
  },
  {
    path: '/fee',
    route: feeRoute,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
