const FSClient = require('../../lib/FSClient');
const DBClient = require('../../lib/DBClient');
const fs = require('fs');

const httpStatus = require('../../lib/http-status-codes');

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
    for (let k in menuEntry.restaurant){
        if (typeof menuEntry.restaurant[k] === 'undefined' || menuEntry.restaurant[k] === ''){
            let err = new Error(`Missing field "restaurant_${k}"`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
        }
    }

    // Uploading to box and saving to db
    let fsClient = new FSClient();
    let dbClient = new DBClient('menus');
    fsClient.uploadMenu(req.file)
        .then(id => {
            menuEntry.file = `/files/${id}`
            return deleteFile(req.file.path);
        })
        .then(() => dbClient.insert(menuEntry))
        .then(dbEntry => res.status(httpStatus.OK_CREATED).send(Object.assign(dbEntry, menuEntry)))
        .catch((err) => {
            return next(err) // Handled by the "menus" specific error handler, in menus/index.js
        });
};

// "Promisifying" the fs.unlink function
function deleteFile(path) {
    return new Promise((res, rej) => {
        fs.unlink(path, err => {
            if (err) {
                console.log(err.stack);
                return rej(new Error('Error while trying to delete the temporary file'));
            }
            return res();
        })
    });
}
