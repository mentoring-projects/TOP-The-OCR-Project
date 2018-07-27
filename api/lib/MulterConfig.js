const multer = require('multer');
const crypto = require('crypto');
const httpStatus = require('./http-status-codes');
const errorMessages = require('./error-messages');

const configs = {
    menus: {
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                let err = new Error(errorMessages.FILE_TYPE_MISMATCH_ERROR('application/pdf', file.mimetype));
                err.status = httpStatus.BAD_REQUEST;
                return cb(err, false);
            }
            return cb(null, true);
        },
        filename: (req, file, cb) => {
            crypto.pseudoRandomBytes(16, function (err, raw) {
                return cb(null, raw.toString('hex') + Date.now() + '.pdf');
            });
        },
        limits: {
            fileSize: 10485760, // 10MB
            files: 1
        }
    }
};

function MulterConfig(type) {
    if (configs[type])
        return multer({
            storage: multer.diskStorage({
                destination: 'uploads',
                fileFilter: configs[type].fileFilter,
                filename: configs[type].filename,
                limits: configs[type].limits
            })
        });
    throw Error(`The specified multer config type doesn't exists: ${type}`)
}

module.exports = MulterConfig;
