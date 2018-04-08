const BoxSDK = require('box-node-sdk');
const fs = require('fs');
const path = require('path');

const appRoot = process.env.BOX_ROOT;

function FSClient() {
    // Read and parse the automatically created Box configuration file.
    let configFile = fs.readFileSync(path.dirname(require.main.filename)+'/config.json');
    configFile = JSON.parse(configFile);

    // Initialize the SDK with the Box configuration file and create a client that uses the Service Account.
    var sdk = new BoxSDK({
        clientID: configFile.boxAppSettings.clientID,
        clientSecret: configFile.boxAppSettings.clientSecret,
        appAuth: {
            keyID: configFile.boxAppSettings.appAuth.publicKeyID,
            privateKey: configFile.boxAppSettings.appAuth.privateKey,
            passphrase: configFile.boxAppSettings.appAuth.passphrase
        }
    });

    // Get an app user client
    this._client = sdk.getAppAuthClient('enterprise', configFile.enterpriseID);
}


FSClient.prototype.uploadMenu = function(file) {
    var stream = fs.createReadStream(file.path);
    return this.getFolderId(appRoot)
        .then((id) => this.getFolderId('upload', id))
        .then((id) => this.upload(`${file.filename}.pdf`, stream, id));
}

FSClient.prototype.upload = function(fileName, fileStream, folderId) {
    return new Promise((res, rej) => {
        this._client.files.uploadFile(folderId, fileName, fileStream, (err, resp) => {
            if (err) return rej(err);
            return res(resp.entries[0].id)
        });
    });
}



FSClient.prototype.getFolderId = function(folder, parentId){
    if (!parentId) parentId = 0;

    return new Promise((res, rej) => {
        this._client.folders.getItems(
            parentId,
            {fields: 'name'},
            (err, resp) => {
                if (err) return rej(err);
                for (let i = 0; i < resp.entries.length; i++) {
                    if (resp.entries[i].name === folder)
                        return res(resp.entries[i].id);
                }
                return res('-1');
            }
        );
    })
}

module.exports = FSClient;
