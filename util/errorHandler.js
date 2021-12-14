const Joi = require('joi');

module.exports = function (error) {
    if ( Joi.isError(error) ) {
        return {
            error: 'VALIDATION_ERROR',
            details: error.details
        }
    } else if ( 
        error.name === 'OktaApiError' ||
        error.name === 'HttpError'
    ) {
        return {
            error: 'OKTA_ERROR',
            ...error
        }
    } else {
        return {
            error: 'SERVER_ERROR',
            ...error
        }
    }
}