const { v4: uuidv4 } = require("uuid");
const specifyID = function (name) {
    return name + uuidv4();
};

module.exports = {
    UNHANDLED_ERROR: 'Encountered an error while processing...',
    VALIDATION_ERROR: 'Encountered an validation error while processing...',

    RESPONSE_SUCCESS: 200,
    RESPONSE_CREATED: 201,
    RESPONSE_BAD_REQUEST: 400,
    RESPONSE_UNAUTHORIZED: 401,
    RESPONSE_FORBIDDEN: 403,
    RESPONSE_INT_SERVER_ERROR: 500,
    RESPONSE_NOT_FOUND: 404,

    specifyID
    
}