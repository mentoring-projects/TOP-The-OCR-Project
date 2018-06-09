const DBClient = require('../../lib/DBClient');
const httpStatus = require('../../lib/http-status-codes');
const errorMessages = require('../../lib/error-messages');

const dbInstance = new DBClient('menus');

module.exports = (req, res, next) => {
    dbInstance.getById(req.params.id)
        .then((resp) => res.status(httpStatus.OK).json(resp))
        .catch((err) => {
            if (err.message === 'missing') {
                err = new Error(errorMessages.DB_DOC_NOT_FOUND(req.params.id));
                err.status = httpStatus.NOT_FOUND;
            } else {
                err = new Error(errorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};
