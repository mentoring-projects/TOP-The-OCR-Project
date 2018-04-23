module.exports.TYPE_MISMATCH_ERROR = function(parameter, expected, received) {
    return `Wrong type for parameter ${parameter}. Received ${received}, expected ${expected}`;
}

module.exports.MISSING_FIELD_ERROR = function(field){
    return `Missing field "${field}"`;
}

module.exports.IO_ERROR = function(file){
    return `File read/write error when trying to access file ${file}`;
}

module.exports.DB_CONNECT_ERROR = () => `Error connecting to the database, check logs for details.`;
module.exports.NO_DB_ERROR = () => 'This client has no default databaset set, and one was not provided.';

module.exports.LIMIT_FILE_SIZE_ERROR = function(maximumSize){
    return `The uploaded file exceeds the maximum file size supported of ${maximumSize/1024/1024}MB.`;
}


