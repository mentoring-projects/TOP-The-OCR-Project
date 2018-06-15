const DBClient = require('../../lib/DBClient');
const httpStatus = require('../../lib/http-status-codes');

const dbInstance = new DBClient('menus');

const errorMessages = require('../../lib/error-messages');

module.exports = (req, res, next) => {
    dbInstance.get()
        .then((resp) => res.status(httpStatus.OK).json(resp))
        .catch((error) => {
            console.log(error.stack);
            let err = new Error(errorMessages.DB_CONNECT_ERROR());
            return next(err)
        })
}
