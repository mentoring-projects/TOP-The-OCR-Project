const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const gs = require('ghostscript4js');
const tesseract = require('node-tesseract');

const errorMessages = require('./error-messages');

function OCR(options) {
    if (typeof options === "object") {
        const acceptedKeys = Object.keys(this.options);
        Object.keys(options).forEach((val) => {
            if (!acceptedKeys.includes(val)) return delete options[val];
            if (typeof this.options[val] !== typeof options[val]) {
                throw Error(errorMessages.TYPE_MISMATCH_ERROR(val, typeof this.options[val], typeof options[val]));
            }
        });
        this.options = Object.assign(this.options, options);
    }
}

OCR.prototype.options = {
    l: 'por',
    psm: 6,
    binary: '/usr/bin/tesseract'
};

OCR.prototype.getText = (filePath) => {
    if (path.extname(filePath) !== '.pdf')
        throw Error(errorMessages.FILE_TYPE_MISMATCH_ERROR('pdf', path.extname(filePath)));
    return PDFtoImage(filePath).then((images) => {
        return ImagesToText(images);
    })
}

module.exports = OCR;

function PDFtoImage(file) {
    let cmd = `sDEVICE=pngalpha -o ${file}-%01d.png -sDEVICE=pngalpha -r500 ${file}`
    let filePath = file.split('/');
    let fileName = filePath.pop();
    filePath = filePath.join('/');
    return new Promise((res, rej) => {
        gs.execute(cmd, (err) => {
            if (err) return rej(err)
            exec(`find ${filePath} | sort | grep -E "${fileName}-[0-9]{1,}.png"`, (err, stdout) => {
                if (err) return rej(err);
                let files = stdout.toString('utf8').split('\n');
                files.pop(); // removes extra line of node exec output
                return res(files);
            });
        })
    })
}

function ImagesToText(images, index, text) {
    if (typeof index === 'undefined') index = 0;
    if (typeof text === 'undefined') text = '';
    return new Promise((res, rej) => {
        tesseract.process(images[index], this.options, function (err, result) {
            if (err) return rej(err);
            text = text + '\n===================\n' + result;
            fs.unlink(images[index], (err) => { if (err) console.log(err); });
            return res(text);
        })
    })
        .then((text) => {
            if (images.length - 1 === index) return text;
            return ImagesToText(images, index + 1, text);
        })
}
