const DBClient = require('../../lib/DBClient');
const httpStatus = require('../../lib/http-status-codes');
const errorMessages = require('../../lib/error-messages');

const dbInstance = new DBClient('menus');

module.exports = (req, res, next) => {
    let params = {
        from: req.query.from,
        size: req.query.size
    }
    for (let k in params) {
        if (!params[k] || !Number.isInteger(Number(params[k]))) {
            let err = new Error(errorMessages.TYPE_MISMATCH_ERROR(k, 'integer', typeof params[k]));
            err.status = httpStatus.BAD_REQUEST;
            return next(err)
        }
    }
    dbInstance.get({ from: params.from, size: params.size })
        .then((resp) => res.status(httpStatus.OK).json(resp))
        .catch((error) => {
            console.log(error.stack);
            let err = new Error(errorMessages.DB_CONNECT_ERROR());
            return next(err)
        })
};
