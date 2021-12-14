const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

module.exports.sign = ( payload ) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, {
            algorithm: 'HS256',
            expiresIn: '10h'
        }, (err, token) => {
            if ( err ) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

module.exports.verify = ( token ) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {
            algorithm: ['HS256']
        }, (err, decoded) => {
            if ( err ) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}
