const FSClient = require('../../lib/FSClient');
const DBClient = require('../../lib/DBClient');
const OCR = require('../../lib/OCR.js');
const fs = require('fs');

const httpStatus = require('../../lib/http-status-codes');
const errorMessages = require('../../lib/error-messages');

module.exports = (req, res, next) => {
    let menuEntry = {
        restaurant: {
            name: req.body.restaurant_name,
            address: req.body.restaurant_address,
            city: req.body.restaurant_city
        },
        file: null,
        ocr: []
    }
    // Check if request is missing parameters
    for (let k in menuEntry.restaurant) {
        if (typeof menuEntry.restaurant[k] === 'undefined' || menuEntry.restaurant[k] === '') {
            let err = new Error(errorMessages.MISSING_FIELD_ERROR(k));
            err.status = httpStatus.BAD_REQUEST;
            throw err;
        }
    }

    // Uploading to box and saving to db
    let fsClient = new FSClient();
    let dbClient = new DBClient('menus');
    fsClient.uploadMenu(req.file)
        .then((id) => {
            menuEntry.file = `/files/${id}`;
            return dbClient.insert(menuEntry)
        })
        .then((dbEntry) => {
            menuEntry = dbEntry;
            return res.status(httpStatus.OK_CREATED).send(menuEntry);
        })
        .catch((err) => {
            next(err) // Handled by the "menus" specific error handler, in menus/index.js
            throw null; // to not process the OCR if an error happened on dbClient.insert
        })
        .then(() => {
            let ocrInstance = new OCR();
            return ocrInstance.getText(req.file.path);
        })
        .then((data) => {
            menuEntry.ocr = [data];
            return dbClient.update(menuEntry);
        })
        .then(() => { return deleteFile(req.file.path) })
        .catch((err) => { if(err){ console.log(err) } });
}

// "Promisifying" the fs.unlink function
function deleteFile(path) {
    return new Promise((res, rej) => {
        fs.unlink(path, err => {
            if (err) {
                console.log(err.stack);
                return rej(new Error(errorMessages.IO_ERROR(path)));
            }
            return res();
        })
    });
}
