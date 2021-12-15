const { Buffer } = require('buffer');
const crypto = require('crypto');
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const algorithm = 'aes-256-cbc';

module.exports.generate = async function(userId) {
    return new Promise((resolve, reject) => {
        try {
            let payload = {
                i: userId,
                t: Date.now()
            };
            payload = JSON.stringify(payload);
            crypto.randomBytes(16, (err, iv) => {
                if ( err ) {
                    reject(err);
                }
        
                const cipher = crypto.createCipheriv(algorithm, key, iv);
                let encrypted = '';
                cipher.setEncoding('hex');
        
                cipher.on('data', chunk => encrypted += chunk);
                cipher.on('end', () => {
                    encrypted = iv.toString('hex') + encrypted;
                    resolve(encrypted);
                });
        
                cipher.write(payload);
                cipher.end();
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports.verify = async function(grantCode) {
    return new Promise((resolve, reject) => {
        try {
            let iv = Buffer.from(grantCode.slice(0, 32), 'hex');
            let encrypted = grantCode.slice(32);

            const decipher = crypto.createDecipheriv(algorithm, key, iv);

            let decrypted = '';
            decipher.on('readable', () => {
                while (null !== (chunk = decipher.read())) {
                    decrypted += chunk.toString('utf8');
                }
            });

            decipher.on('end', () => {
                decrypted = JSON.parse(decrypted);
                if ( 
                    decrypted && 
                    decrypted.i && 
                    decrypted.t &&
                    Date.now() - decrypted.t < 30*1000
                ) {
                    resolve(decrypted);
                } else {
                    resolve(false);
                }
            });

            decipher.write(encrypted, 'hex');
            decipher.end();
        } catch ( error ) {
            resolve(false);
        }
    });
}