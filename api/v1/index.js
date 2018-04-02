const routes = require('express').Router();
const menus = require('./menus');

routes.use('/menus', menus);

module.exports = routes;
