const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const Schemas = require('./schemas');
const errorMessages = require('./error-messages');

function JSONValidator() {
    this.validSchemas = Object.keys(Schemas);
}

JSONValidator.prototype.isValid = function (doc, schemaName) {
    if (!this.validSchemas.includes(schemaName))
        throw new Error(errorMessages.INVALID_SCHEMA_ERROR(this.validSchemas.join(', ')));
    let validate = ajv.compile(Schemas[schemaName]);
    if (!validate(doc)) return false;
    return true;
}

JSONValidator.prototype.getSchema = function (schemaName) {
    return JSON.stringify(Schemas[schemaName], null, 2);
}

JSONValidator.prototype.sanitize = function(doc, schemaName) {
    if (!this.validSchemas.includes(schemaName))
        throw new Error(errorMessages.INVALID_SCHEMA_ERROR(this.validSchemas.join(', ')));
    let validate = ajv.compile(Schemas[schemaName])
    if (validate(doc)) return doc // Returns sanitized document
    throw new Error(errorMessages.INVALID_SCHEMA_FIELDS_ERROR(schemaName, this.getSchema(schemaName)));
}

JSONValidator.prototype.sanitizeList = function (list, schemaName) {
    if (!Array.isArray(list))
        throw new Error(errorMessages.TYPE_MISMATCH_ERROR('list', 'array', typeof list))
    list.forEach((el, i) => {
        list[i] = this.sanitize(el, schemaName);
    })
    return list;
}

module.exports = JSONValidator;
