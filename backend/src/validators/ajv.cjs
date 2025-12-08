const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ 
    allErrors: true, 
    removeAdditional: true,
    strict: false
});

addFormats(ajv);

module.exports = ajv;