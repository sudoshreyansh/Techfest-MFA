const { ExpressOIDC } = require('@okta/oidc-middleware');

module.exports = new ExpressOIDC({
    issuer: `${process.env.OKTA_URI}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    redirect_uri: `${process.env.BASE_URI}/callback`,
    appBaseUrl: process.env.BASE_URI,
    scope: 'openid profile',
    routes: {
        loginCallback: {
            path: '/callback',
            afterCallback: '/success'
        }
    }
});