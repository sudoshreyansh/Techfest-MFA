const oktaClient = require('./okta');
const Joi = require('joi');
const errorHandler = require('../util/errorHandler');
const jwt = require('../util/jwt');

const registerSchema = new Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
});

const activationSchema = new Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string()
});

const verificationSchema = new Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string()
});

const loginSchema = new Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

const sessionSchema = new Joi.object({
    sessionId: Joi.string().required()
});

const tokenSchema = new Joi.object({
    token: Joi.string().required()
});

function findFactor(type, collection) {
    return new Promise((resolve, reject) => {
        collection.each(factor => {
            if ( factor.factorType === type ) {
                resolve(factor);
            }
        });
    });
}

async function enrollMFA(userId, email) {
    let factor = {
        factorType: 'email',
        provider: 'OKTA',
        profile: {
            email: email
        }
    };
    await oktaClient.enrollFactor(userId, factor);
}

async function register(req, res) {
    try {
        const validatedBody = await registerSchema.validateAsync(req.body);

        let user = {
            profile: {
                firstName: validatedBody.firstName,
                lastName: validatedBody.lastName,
                email: validatedBody.email,
                login: validatedBody.email,
            },
            credentials: {
                password: {
                    value: validatedBody.password
                }
            }
        };

        user = await oktaClient.createUser(user, {
            activate: true
        });

        await enrollMFA(user.id, validatedBody.email);
    
        res.json({
            userId: user.id
        });
    } catch ( error ) {
        res.json({
            success: false,
            error: error.errorCauses[0] ? error.errorCauses[0].summary : error.errorSummary
        });
    }
}

async function login(req, res) {
    try {
        const validatedBody = await loginSchema.validateAsync(req.body);

        let authResponse = await oktaClient.http.postJson(`${oktaClient.baseUrl}/api/v1/authn`, {
            body: {
                username: validatedBody.email,
                password: validatedBody.password
            }
        });
        
        let userId = authResponse._embedded.user.id;
        let factors = await oktaClient.listFactors(userId);
        let emailFactor = await findFactor('email', factors);
        
        if ( emailFactor.status !== 'ACTIVE' ) {
            res.json({
                userId
            });
        } else {
            let session = await oktaClient.createSession({
                sessionToken: authResponse.sessionToken
            });
            res.json(session);
        }
    } catch (error) {
        console.log(error.name, typeof error);
        res.json( errorHandler( error ) );
    }
}

async function activate(req, res) {
    try {
        const validatedBody = await activationSchema.validateAsync(req.body);

        if ( !validatedBody.otp ) {
            let user = await oktaClient.getUser(validatedBody.userId);
            await enrollMFA(user.id, user.profile.email);
            res.json({
                success: true
            });
            return;
        }
        
        let factors = await oktaClient.listFactors(validatedBody.userId);
        let emailFactor = await findFactor('email', factors);

        await oktaClient.activateFactor(validatedBody.userId, emailFactor.id, {
            passCode: validatedBody.otp
        });
        res.json({
            success: true
        });
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

async function verifyMFA(req, res) {
    try {
        const validatedBody = await verificationSchema.validateAsync(req.body);

        let factors = await oktaClient.listFactors(validatedBody.userId);
        let emailFactor = await findFactor('email', factors);

        if ( validatedBody.otp ) {
            await emailFactor.verify(validatedBody.userId, {
                passCode: validatedBody.otp
            });
        } else {
            await emailFactor.verify(validatedBody.userId);
        }

        res.json({
            success: true
        });
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

async function getUserFromSession(req, res) {
    try {
        const validatedBody = await sessionSchema.validateAsync(req.body);

        let session = await oktaClient.getSession(validatedBody.sessionId);
        let user = await oktaClient.getUser(session.userId);
        res.json(user);
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

async function logout(req, res) {
    try {
        const validatedBody = await sessionSchema.validateAsync(req.body)

        await oktaClient.endSession(validatedBody.sessionId);
        res.json({
            success: true
        });
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

async function generateSSO(req, res) {
    try {
        const validatedBody = await sessionSchema.validateAsync(req.body);

        let session = await oktaClient.getSession(validatedBody.sessionId);
        let user = await oktaClient.getUser(session.userId);

        let token = await jwt.sign(user.profile);
        res.json({
            token
        });
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

async function verifySSO(req, res) {
    try {
        const validatedBody = await tokenSchema.validateAsync(req.body);

        let token = validatedBody.token;
        let profile = await jwt.verify(token);
        req.json(profile);
    } catch ( error ) {
        res.json( errorHandler( error ) );
    }
}

module.exports = {
    register,
    login,
    activate,
    verifyMFA,
    logout,
    getUserFromSession,
    generateSSO,
    verifySSO
};