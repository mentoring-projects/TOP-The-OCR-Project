const DBClient = require('../../lib/DBClient');
const httpStatus = require('../../lib/http-status-codes');

const dbInstance = new DBClient();

module.exports = (req, res, next) => {
    dbInstance.get('menus')
        .then((resp) => res.status(httpStatus.OK).json(resp))
        .catch((error) => {
            console.log(error.stack);
            let err = new Error('Cannot connect to the database');
            return next(err)
        })
}
