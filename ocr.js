const tesseract = require('node-tesseract');

function OCR(options){
  if (typeof options === "object") {
    const acceptedKeys = Object.keys(this.options);
    Object.keys(options).forEach((val) => {
      if (!acceptedKeys.includes(val)) return delete options[val];
      if (typeof this.options[val] !== typeof options[val]) {
        let errorMessage = `Mismatch type for option "${val}", ` +
        `expected ${typeof this.options[val]}, received ${typeof options[val]}`;
        throw new TypeError(errorMessage);
      }
    });
    this.options = Object.assign(this.__proto__.options, options);
  }
}

OCR.prototype.options = {
	l: 'por',
	psm: 6,
	binary: '/usr/bin/tesseract'
};

OCR.prototype.getText = (img_path,cb) => {
  tesseract.process(__dirname + '/' + img_path, this.options, function(err, text) {
    if(err) return cb(err);
    cb(null, text);
  });
}

module.exports = OCR;