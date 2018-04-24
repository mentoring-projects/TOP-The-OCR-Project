module.exports = {
    "type": "object",
    "properties": {
        "_id": {
            "type": "string"
        },
        "_rev": {
            "type": "string"
        },
        "restaurant": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "address": {
                    "type": "string"
                },
                "city": {
                    "type": "string"
                }
            },
            "required": [ "name", "address", "city" ],
            "additionalProperties": false
        },
        "file": {
            "type": "string"
        },
        "ocr": {
            "type": "array",
            "items": [
                { "type": "string" }
            ]
        }
    },
    "required": [ "restaurant", "file" ],
    "additionalProperties": false
};

