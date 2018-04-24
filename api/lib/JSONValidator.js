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

module.exports = JSONValidator;
