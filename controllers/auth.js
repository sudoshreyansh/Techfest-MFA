const oktaClient = require('./okta');
const Joi = require('joi');

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
            success: true,
            userId: user.id
        });
    } catch ( error ) {
        console.log(error);
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
                success: true,
                userId
            });
        } else {
            let session = await oktaClient.createSession({
                sessionToken: authResponse.sessionToken
            });
            res.json({
                success: true,
                ...session
            });
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            error: error.errorCauses[0] ? error.errorCauses[0].summary : error.errorSummary
        });
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
        console.log(error);
        res.json({
            success: false
        });
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
        console.log(error);
        res.json({
            success: false
        });
    }
}

module.exports = {
    register,
    login,
    activate,
    verifyMFA
};