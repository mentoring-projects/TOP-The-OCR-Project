const Cloudant = require('@cloudant/cloudant');

const user = process.env.CLOUDANT_USER;
const pw = process.env.CLOUDANT_PW;

function DBClient(db) {
    if (db && typeof db !== 'string')
        throw new Error(`DBClient db parameter must be of type string, ${typeof db} received.`);
    this._db = db || null;
    this._client = Cloudant({account:user, password:pw});
}

DBClient.prototype.get = function(db, from, size) {
    return new Promise((res, rej) => {
        let database = this._client.db.use(db);
        database.list({include_docs: true, skip: from, limit: size},
            function(err, body) {
                if (err) return rej(err);
                return res(body.rows);
            });
    });
}

DBClient.prototype.insert = function(doc, options) {
    validateDB(this, options)
    let db = this._db || options.db;
    return new Promise((res, rej) => {
        let database = this._client.db.use(db);
        database.insert(doc, (err, body, header) => {
            if (err) return rej(err);
            if (body.ok) return res(body);
            else return rej(body);
        });
    });
}

module.exports = DBClient;

// Private functions

function validateDB(instance, options) {
    if (!instance._db){
        if (!(options && options.db))
            throw new Error('This client has no default databaset set, and one was not provided.');
        if (typeof options.db !== 'string')
            throw new Error(`Wrong type for parameter DB. ` +
                `Received ${typeof options.db}, expected a string.`);
    }
}
