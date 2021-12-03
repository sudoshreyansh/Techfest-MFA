const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_LOCATION);

module.exports.sign = ( payload ) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, privateKey, {
            algorithm: 'ES256',
            expiresIn: '1h'
        }, (err, token) => {
            if ( err ) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}