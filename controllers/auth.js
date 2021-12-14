const oktaClient = require('./okta');

function findFactor(type, collection) {
    return new Promise((resolve, reject) => {
        collection.each(factor => {
            if ( factor.factorType === type ) {
                resolve(factor);
            }
        });
    });
} 

async function register(req, res) {
    try {
        let user = {
            profile: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                login: req.body.email,
            },
            credentials: {
                password: {
                    value: req.body.password
                }
            }
        };
    
        user = await oktaClient.createUser(user, {
            activate: false
        });
        
        await user.activate({
            sendEmail: true
        });
    
        res.json({
            success: true
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
        let authResponse = await oktaClient.http.postJson(`${oktaClient.baseUrl}/api/v1/authn`, {
            body: {
                username: req.body.username,
                password: req.body.password
            }
        });
    
        let session = await oktaClient.createSession({
            sessionToken: authResponse.sessionToken
        });
        res.json({
            success: true,
            ...session
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.errorCauses[0] ? error.errorCauses[0].summary : error.errorSummary
        });
    }
}

async function enrollMFA(req, res) {
    let factor = {
        factorType: 'email',
        provider: 'OKTA',
        profile: {
            email: req.body.email
        }
    };
    
    try {
        let userFactor = await oktaClient.enrollFactor(req.body.userId, factor);
        res.json({
            success: true
        });
    } catch ( error ) {
        res.json({
            success: false
        });
    }
}

async function activateMFA(req, res) {
    let factors = await oktaClient.listFactors(req.body.userId);
    let emailFactor = await findFactor('email', factors);

    try {
        await oktaClient.activateFactor(req.body.userId, emailFactor.id, {
            passCode: req.body.otp
        });
        res.json({
            success: true
        });
    } catch ( error ) {
        res.json({
            success: false
        });
    }
}

async function verifyMFA(req, res) {
    let factors = await oktaClient.listFactors(req.body.userId);
    let emailFactor = await findFactor('email', factors);
    
    try {
        if ( req.body.otp ) {
            await emailFactor.verify(req.body.userId, {
                passCode: req.body.otp
            });
        } else {
            await emailFactor.verify(req.body.userId);
        }

        res.json({
            success: true
        });
    } catch ( error ) {
        res.json({
            success: false
        });
    }
}

module.exports = {
    register,
    login,
    enrollMFA,
    activateMFA,
    verifyMFA
};