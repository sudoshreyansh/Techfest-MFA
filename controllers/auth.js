const appModel = require('../model/app');
const userModel = require('../model/user');
const jwt = require('../util/jwt');

async function login (req, res) {
    if (
        typeof req.query.app_id === 'string' &&
        typeof req.query.sensitive === 'string' &&
        typeof req.query.state === 'string'
    ) {

        let app = await appModel.findOne({
            id: req.query.app_id
        });

        if ( !app ) {
            res.send('Invalid App');
            return;
        }

        req.session.appId = req.query.app_id;
        req.session.sensitive = req.query.sensitive;
        req.session.state = req.query.state;
        req.session.authState = 1;

        if (
            res.sensitive === 'true' ||
            !req.userContext
        ) {
            res.redirect('/login');
        } else {
            res.redirect('/success');
        }
    } else {
        res.send('Invalid Request');
    }
}

async function success(req, res) {
    if ( req.session.authState === 1 && req.isAuthenticated() ) {
        let user = await userModel.findOne({
            id: req.userContext.userinfo.sub
        });

        if ( !user ) {
            user = new userModel({
                id: req.userContext.userinfo.sub
            });
            await user.save();
        }
        
        let app = await appModel.findOne({
            id: req.session.appId
        });

        if ( !app ) {
            res.send('There was an issue. Please try again later.');
            return;
        }

        if ( user.authorizedApps.includes(app.id) ) {
            delete req.session.authState;
            res.redirect(app.successUrl);
        } else {
            req.session.authState = 2;
            res.send(`Do you wish to continue to ${app.name} with ${req.userContext.userinfo.preferred_username}`);
        }
    } else {
        res.send('Invalid request');
    }
}

async function successCallback(req, res) {
    if ( req.session.authState === 2 && req.isAuthenticated() ) {
        let user = await userModel.findOne({
            id: req.userContext.userinfo.sub
        });
        
        let app = await appModel.findOne({
            id: req.session.appId
        });

        if ( !user || !app ) {
            res.send('There was an issue. Please try again later.');
            return;
        }

        user.authorizedApps.push(app.id);
        await user.save();

        let payload = {
            userInfo: {
                id: req.userContext.userInfo.sub,
                email: req.userContext.userInfo.preferred_username,
                firstName: req.userContext.userInfo.first_name,
                familyName: req.userContext.userInfo.family_name
            },
            mfa: (req.session.sensitive === 'true') ? true : false,
            appId: req.session.appId,
            state: req.session.state
        }
        let token = await jwt.sign(payload);
        res.send(token);
    } else {
        res.send('0');
    }
    
    delete req.session.authState;
    delete req.session.appId;
    delete req.session.state;
    delete req.session.sensitive;
}

module.exports = {
    login,
    success,
    successCallback
}