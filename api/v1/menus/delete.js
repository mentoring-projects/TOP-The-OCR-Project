const FSClient = require('../../lib/FSClient');
const DBClient = require('../../lib/DBClient');

const httpStatus = require('../../lib/http-status-codes');
const errorMessages = require('../../lib/error-messages');

module.exports = (req, res, next) => {
    let fsClient = new FSClient();
    let dbClient = new DBClient('menus');
    // getById is used to get the _rev and the fileId
    dbClient.getById(req.params.id)
        .then((resp) => {
            let fileId = resp.file;
            // delete uses the id and rev to delete the doc
            dbClient.delete(resp._id, resp._rev).then((resp) => {
                // while is processing the delete of the file in the 'box', the user receives a success message already.
                fsClient.delete(fileId).then((data) => {
                    console.log('File ' + fileId + ' from doc ' +
                        req.params.id + ' was deleted successfully');
                })
                    .catch((err) => {
                        console.log(err.stack)
                    })
                return res.status(httpStatus.OK).json(resp);
            })
                .catch((err) => {
                    err = new Error(errorMessages.INTERNAL_SERVER_ERROR());
                    return next(err)
                })
        })
        .catch((err) => {
            if (err.message === 'missing' || err.message === 'deleted') {
                err = new Error(errorMessages.DB_DOC_NOT_FOUND(req.params.id));
                err.status = httpStatus.NOT_FOUND;
            } else {
                err = new Error(errorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};
