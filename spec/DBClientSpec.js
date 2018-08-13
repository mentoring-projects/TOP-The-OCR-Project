require('dotenv').config();
const Cloudant = require('@cloudant/cloudant');
const jasmine = require('jasmine');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });
const DBClient = require('../api/lib/DBClient');
const Schemas = require('../api/lib/schemas');
let jasmineTimeout = 10000;

describe('DBClient tests setup', () => {
    beforeAll(() => {
        const user = process.env.CLOUDANT_USER;
        const pw = process.env.CLOUDANT_PW;
        this._client = Cloudant({ account: user, password: pw, plugins: 'promises' });
        this._ajvValidate = ajv.compile(Schemas.menus);
        this.dbInstance = new DBClient('menus-test');
    });
    beforeEach(async () => {
        const menuEntry = {
            "_id": "test",
            "restaurant": {
                "name": "test",
                "address": "test",
                "city": "test"
            },
            "file": "test",
            "ocr": []
        }
        await this._client.db.create('menus-test');
        let listDbs = await this._client.db.list();
        expect(listDbs.includes('menus-test')).toBe(true);
        let database = this._client.db.use('menus-test');
        let menu = await database.insert(menuEntry);
        expect(menu.ok).toBe(true);
        let checkMenu = await database.get(menu.id);
        delete checkMenu._rev;
        delete checkMenu.statusCode;
        expect(checkMenu).toEqual(menuEntry);
    }, jasmineTimeout);
    afterEach(async () => {
        await this._client.db.destroy('menus-test');
        let listDbs = await this._client.db.list();
        expect(listDbs.includes('menus-test')).toBe(false);
    }, jasmineTimeout);

    describe('DBClient constructor', () => {
        it('should throw an error when db param is different than undefined/string', () => {
            expect(function () { new DBClient(1); })
                .toThrowError('Wrong type for parameter db. Received number, expected string');
        });
        it('should have a null value for _db when db param is empty', () => {
            let dbInstance = new DBClient();
            expect(dbInstance._db).toBeNull();
            expect(typeof dbInstance._client).toBe('object');
        });
        it('should have a string value for _db when db param is string', () => {
            expect(typeof this.dbInstance._db).toBe('string');
            expect(typeof this.dbInstance._client).toBe('object');
        });
    });

    describe('DBClient.get', () => {
        it('should throw a NO_DB_ERROR when not initiating the constructor db param and trying to get the database without using the options.db param', () => {
            let dbInstance = new DBClient();
            expect(function () { dbInstance.get(); })
                .toThrowError('This client has no default databaset set, and one was not provided.');
        });
        it('should return an array of valid menus schema when initiating the db menus on the constructor', async () => {
            let menus = await this.dbInstance.get({ schemaName: 'menus' });
            expect(menus.length).toBeGreaterThanOrEqual(1);
            menus.forEach(menu => {
                expect(this._ajvValidate(menu)).toBe(true);
            });
        }, jasmineTimeout);
        it('should return an array of valid menus schema when not initiating the constructor db param and trying to get the database using the options.db === menus param', async () => {
            let dbInstance = new DBClient();
            let menus = await dbInstance.get({ db: 'menus-test', schemaName: 'menus' });
            expect(menus.length).toBeGreaterThanOrEqual(1);
            menus.forEach(menu => {
                expect(this._ajvValidate(menu)).toBe(true);
            });
        }, jasmineTimeout);
        it('should throw an error when opt db param is different than string', async () => {
            let errMessage;
            let dbInstance = new DBClient();
            try {
                await dbInstance.get({ db: 1, schemaName: 'menus' })
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('Wrong type for parameter db. Received number, expected string');
        }, jasmineTimeout);
        it('should throw an error when one or more of the documents on menus-test db does not match with menus schema', async () => {
            let errMessage;
            const invalidMenuEntry = {
                "_id": "invalidTest",
                "restaurant": {
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let database = this._client.db.use('menus-test');
            let menu = await database.insert(invalidMenuEntry);
            expect(menu.ok).toBe(true);
            let checkMenu = await database.get(menu.id);
            delete checkMenu._rev;
            delete checkMenu.statusCode;
            expect(checkMenu).toEqual(invalidMenuEntry);
            try {
                await this.dbInstance.get({ schemaName: 'menus' })
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toMatch('menus schema must be like that');
        }, jasmineTimeout);
        it('should throw an error when getting a non existing db', async () => {
            let errMessage;
            let dbInstance = new DBClient('non-existing-db');
            try {
                await dbInstance.get()
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toEqual('Database does not exist.');
        }, jasmineTimeout);
    });

    describe('DBClient.getById', () => {
        it('should throw a TYPE_MISMATCH_ERROR error when id param is different than string', async () => {
            let errMessage;
            try {
                await this.dbInstance.getById(1);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('Wrong type for parameter id. Received number, expected string');
        });
        it('should have a valid menus schema object when passed a valid id and a valid db', async () => {
            let _id = 'test';
            let menu = await this.dbInstance.getById(_id, { schemaName: 'menus' });
            expect(this._ajvValidate(menu)).toBe(true);
        }, jasmineTimeout);
        it('should have a valid menus schema object when passed a valid id and a valid db, using db opt', async () => {
            let _id = 'test';
            let dbInstance = new DBClient();
            let menu = await dbInstance.getById(_id, { db: 'menus-test', schemaName: 'menus' });
            expect(this._ajvValidate(menu)).toBe(true);
        }, jasmineTimeout);
        it('should throw an error when the document on menus-test db does not match with menus schema', async () => {
            let errMessage;
            const invalidMenuEntry = {
                "_id": "invalidTest",
                "restaurant": {
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let database = this._client.db.use('menus-test');
            let menu = await database.insert(invalidMenuEntry);
            expect(menu.ok).toBe(true);
            let checkMenu = await database.get(menu.id);
            delete checkMenu._rev;
            delete checkMenu.statusCode;
            expect(checkMenu).toEqual(invalidMenuEntry);
            try {
                await this.dbInstance.getById('invalidTest', { schemaName: 'menus' })
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toMatch('menus schema must be like that');
        }, jasmineTimeout);
        it('should throw an error when a non existing ID is passed', async () => {
            let errMessage;
            let _id = 'non-existing-id';
            try {
                await this.dbInstance.getById(_id);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('missing');
        }, jasmineTimeout);
    });

    describe('DBClient.insert', () => {
        it('should throw an INVALID_SCHEMA_FIELDS_ERROR error when the object passed does not match with menus schema', async () => {
            let errMessage;
            let menuEntry = {
                "restaurant": {
                    "name": "test",
                    "address": "test",
                    "city": "test"
                },
                "ocr": []
            }
            try {
                await this.dbInstance.insert(menuEntry, { schemaName: 'menus' });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toMatch('menus schema must be like that');
        }, jasmineTimeout);
        it('should have a valid menus schema object when passed an object that matches with menus schema and a valid db', async () => {
            let menuEntry = {
                "restaurant": {
                    "name": "test",
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let menu = await this.dbInstance.insert(menuEntry, { schemaName: 'menus' });
            expect(this._ajvValidate(menu)).toBe(true);
            delete menu._id;
            delete menu._rev;
            expect(menu).toEqual(menuEntry);
        }, jasmineTimeout);
        it('should have a valid menus schema object when passed an object that matches with menus schema and a valid db passed in the db opt', async () => {
            let menuEntry = {
                "restaurant": {
                    "name": "test",
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let dbInstance = new DBClient();
            let menu = await dbInstance.insert(menuEntry, { db: 'menus-test', schemaName: 'menus' });
            expect(this._ajvValidate(menu)).toBe(true);
            delete menu._id;
            delete menu._rev;
            expect(menu).toEqual(menuEntry);
        }, jasmineTimeout);
        it('should throw an error when registering a menu on a non existing db', async () => {
            let errMessage;
            let menuEntry = {
                "restaurant": {
                    "name": "test",
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let dbInstance = new DBClient('non-existing-db');
            try {
                await dbInstance.insert(menuEntry, { schemaName: 'menus' });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toEqual('Database does not exist.');
        }, jasmineTimeout);
    });

    describe('DBClient.update', () => {
        it('should throw an INVALID_SCHEMA_FIELDS_ERROR error when the object passed does not match with menus schema', async () => {
            let errMessage;
            let menuEntry = {
                "restaurant": {
                    "name": "test",
                    "address": "test",
                    "city": "test"
                },
                "ocr": []
            }
            try {
                await this.dbInstance.update(menuEntry, { schemaName: 'menus' });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toMatch('menus schema must be like that');
        }, jasmineTimeout);
        it('should update the object when passed an object that matches with menus schema and a valid db', async () => {
            let _id = 'test';
            let menu = await this.dbInstance.getById(_id, { schemaName: 'menus' });
            let menuEntry = {
                "_id": menu._id,
                "_rev": menu._rev,
                "restaurant": {
                    "name": "test2",
                    "address": "test",
                    "city": "test"
                },
                "file": "test",
                "ocr": []
            }
            let updateMenu = await this.dbInstance.update(menuEntry, { schemaName: 'menus' });
            delete menuEntry._rev;
            delete updateMenu._rev;
            expect(updateMenu).toEqual(menuEntry);
        }, jasmineTimeout);
    });

    describe('DBClient.delete', () => {
        it('should throw a TYPE_MISMATCH_ERROR error when id param is different than string', async () => {
            let errMessage;
            let _id = 1;
            let _rev = 'test';
            try {
                await this.dbInstance.delete(_id, _rev);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('Wrong type for parameter id. Received number, expected string');
        }, jasmineTimeout);
        it('should throw a TYPE_MISMATCH_ERROR error when rev param is different than string', async () => {
            let errMessage;
            let _id = 'test';
            let _rev = 1;
            try {
                await this.dbInstance.delete(_id, _rev);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('Wrong type for parameter rev. Received number, expected string');
        }, jasmineTimeout);
        it('should delete the document when its valid id and rev is passed to the menus database', async () => {
            let error = false;
            let _id = 'test';
            let menu = await this.dbInstance.getById(_id, { schemaName: 'menus' });
            try {
                await this.dbInstance.delete(menu._id, menu._rev);
            } catch (err) {
                error = true;
            }
            expect(error).toBe(false);
        }, jasmineTimeout);
        it('should delete the document when its valid id and rev is passed to the menus database, using db opt', async () => {
            let error = false;
            let _id = 'test';
            let dbInstance = new DBClient();
            let menu = await dbInstance.getById(_id, { db: 'menus-test', schemaName: 'menus' });
            try {
                await dbInstance.delete(menu._id, menu._rev, { db: 'menus-test' });
            } catch (err) {
                error = true;
            }
            expect(error).toBe(false);
        }, jasmineTimeout);
        it('should throw an error when passing a non existing id', async () => {
            let errMessage;
            let _id = 'non-existing-id';
            let _rev = 'rev';
            try {
                await this.dbInstance.delete(_id, _rev);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('missing');
        }, jasmineTimeout);
    });
});
