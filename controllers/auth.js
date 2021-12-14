const { EmailUserFactor, EmailUserFactorProfile } = require('@okta/okta-sdk-nodejs');
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

// const appModel = require('../model/app');
// const userModel = require('../model/user');
// const jwt = require('../util/jwt');

// async function login (req, res) {
//     if (
//         typeof req.query.app_id === 'string' &&
//         typeof req.query.sensitive === 'string' &&
//         typeof req.query.state === 'string'
//     ) {

//         let app = await appModel.findOne({
//             id: req.query.app_id
//         });

//         if ( !app ) {
//             res.send('Invalid App');
//             return;
//         }

//         req.session.appId = req.query.app_id;
//         req.session.sensitive = req.query.sensitive;
//         req.session.state = req.query.state;
//         req.session.authState = 1;

//         if (
//             res.sensitive === 'true' ||
//             !req.userContext
//         ) {
//             res.redirect('/login');
//         } else {
//             res.redirect('/authorize');
//         }
//     } else {
//         res.send('Invalid Request');
//     }
// }

// async function success(req, res) {
//     if ( req.session.authState === 1 && req.isAuthenticated() ) {
//         let user = await userModel.findOne({
//             id: req.userContext.userinfo.sub
//         });

//         if ( !user ) {
//             user = new userModel({
//                 id: req.userContext.userinfo.sub
//             });
//             await user.save();
//         }
        
//         let app = await appModel.findOne({
//             id: req.session.appId
//         });

//         if ( !app ) {
//             res.render('index', {
//                 title: 'An error occured',
//                 description: 'There was an issue. Please try again.',
//                 script: 'none'
//             });
//             return;
//         }

//         if ( user.authorizedApps.includes(app.id) ) {
//             req.session.authState = 2;
//             res.render('index', {
//                 title: 'Logging In',
//                 description: 'Please wait while we log you in...',
//                 script: 'login',
//                 successUrl: app.successUrl
//             });
//         } else {
//             req.session.authState = 2;
//             let email = req.userContext.userinfo.preferred_username;
//             email = email.split('@');
//             email = email[0].slice(0, 3) + '****@****' + email[1].slice(email[1].length - 5);
//             res.render('index', {
//                 title: 'Authorize App',
//                 description: `Do you wish to authorize <b>${app.name}</b> as <b>${email}</b>`,
//                 script: 'login-with-cta',
//                 successUrl: app.successUrl
//             });
//         }
//     } else {
//         res.render('index', {
//             title: 'Invalid Request',
//             description: 'There was an issue. Please try again.',
//             script: 'none'
//         });
//     }
// }

// async function successCallback(req, res) {
//     if ( req.session.authState === 2 && req.isAuthenticated() ) {
//         let user = await userModel.findOne({
//             id: req.userContext.userinfo.sub
//         });
        
//         let app = await appModel.findOne({
//             id: req.session.appId
//         });

//         if ( !user || !app ) {
//             res.send('0');
//             return;
//         }

//         if ( !user.authorizedApps.includes(app.id) ) {
//             user.authorizedApps.push(app.id);
//             await user.save();
//         }

//         let payload = {
//             userInfo: {
//                 id: req.userContext.userinfo.sub,
//                 email: req.userContext.userinfo.preferred_username,
//                 firstName: req.userContext.userinfo.given_name,
//                 familyName: req.userContext.userinfo.family_name
//             },
//             mfa: (req.session.sensitive === 'true') ? true : false,
//             appId: req.session.appId,
//             state: req.session.state
//         }
//         let token = await jwt.sign(payload);
//         res.send(token);
//     } else {
//         res.send('0');
//     }
    
//     delete req.session.authState;
//     delete req.session.appId;
//     delete req.session.state;
//     delete req.session.sensitive;
// }

// module.exports = {
//     login,
//     success,
//     successCallback
// }