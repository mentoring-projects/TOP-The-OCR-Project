const multer  = require('multer');
const httpStatus = require('./http-status-codes');

const configs = {
    menus: {
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf'){
                let err = new Error(`Wrong file type: "${file.mimetype}"`);
                err.status = httpStatus.BAD_REQUEST;
                return cb(err, false);
            }
            return cb(null, true);
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
            dest: 'uploads',
            fileFilter: configs[type].fileFilter,
            limits:  configs[type].limits
        });
    throw Error(`The specified multer config type doesn't exists: ${type}`)
}

module.exports = MulterConfig;
