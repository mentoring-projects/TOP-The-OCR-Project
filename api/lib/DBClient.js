const Cloudant = require('@cloudant/cloudant');
const JSONValidator = require('./JSONValidator');

const user = process.env.CLOUDANT_USER;
const pw = process.env.CLOUDANT_PW;

const errorMessages = require('./error-messages');

function DBClient(db) {
    if (db && typeof db !== 'string')
        throw new Error(errorMessages.TYPE_MISMATCH_ERROR('db', 'string', typeof db));
    this._db = db || null;
    this._client = Cloudant({ account: user, password: pw });
}

DBClient.prototype.get = function (options) {
    if (typeof options !== 'object')
        options = {
            from: undefined,
            size: undefined
        }
    validateDB(this, options)
    const jsonValidator = new JSONValidator();
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        const database = this._client.db.use(db);
        database.list({ include_docs: true, skip: options.from, limit: options.size },
            function (err, body) {
                if (err) return rej(err);
                let list = []
                body.rows.forEach((el) => {
                    list.push(el.doc)
                });
                try {
                    return res(jsonValidator.sanitizeList(list, db));
                } catch (syncErr) {
                    return rej(syncErr)
                }
            });
    });
}

DBClient.prototype.getById = function (id, options) {
    validateDB(this, options)
    const jsonValidator = new JSONValidator();
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        if (typeof id !== 'string')
            return rej(new Error(errorMessages.TYPE_MISMATCH_ERROR('id', 'string', typeof id)));
        const database = this._client.db.use(db);
        database.get(id, function (err, body) {
            if (err) return rej(err);
            try {
                return res(jsonValidator.sanitize(body, db));
            } catch (validateError) {
                return rej(validateError);
            }
        });
    });
}

DBClient.prototype.insert = function (doc, options) {
    validateDB(this, options)
    const jsonValidator = new JSONValidator();
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        if (!jsonValidator.isValid(doc, db))
            return rej(new Error(errorMessages.INVALID_SCHEMA_FIELDS_ERROR(db, jsonValidator.getSchema(db))));
        const database = this._client.db.use(db);
        database.insert(doc, (err, body, header) => {
            if (err) return rej(err);
            if (body.ok) {
                doc._id = body.id;
                doc._rev = body.rev;
                return res(doc);
            } else return rej(body);
        });
    });
}

DBClient.prototype.update = function(doc, options) {
    return this.insert(doc, options);
}

DBClient.prototype.delete = function(id, rev, options) {
    if (!id || typeof id !== 'string')
        throw new Error(errorMessages.TYPE_MISMATCH_ERROR('id', 'string', typeof id));
    if (!rev || typeof rev !== 'string')
        throw new Error(errorMessages.TYPE_MISMATCH_ERROR('rev', 'string', typeof rev));
    validateDB(this, options)
    const db = this._db || options.db;
    const database = this._client.db.use(db);
    return new Promise((res, rej) => {
        database.destroy(id, rev, (err, body) => {
            if (err) return rej(err);
            return res(body);
        })
    });
}

module.exports = DBClient;

// Private functions

function validateDB(instance, options) {
    if (!instance._db) {
        if (!(options && options.db))
            throw new Error(errorMessages.NO_DB_ERROR());
        if (typeof options.db !== 'string')
            throw new Error(errorMessages.TYPE_MISMATCH_ERROR('db', 'string', typeof options.db));
    }
}
