const DBClient = require('../../lib/DBClient');
const httpStatus = require('../../lib/http-status-codes');

const dbInstance = new DBClient();

const errorMessages = require('../../lib/error-messages');

module.exports = (req, res, next) => {
    dbInstance.get('menus')
        .then((resp) => res.status(httpStatus.OK).json(resp))
        .catch((error) => {
            console.log(error.stack);
            let err = new Error(errorMessages.DB_CONNECT_ERROR());
            return next(err)
        })
}
