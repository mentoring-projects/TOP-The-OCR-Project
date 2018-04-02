const routes = require('express').Router();
const v1 = require('./v1');

routes.use('/v1', v1);
// Later on we may have other API versions, that will be added here.

module.exports = routes;
