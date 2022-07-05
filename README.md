# Authentication Microservice using Okta

This microservice provides authentication services to applications using Okta as its provider.  <br />
Along with basic authentication, it supports:

- [x] Multi-factor authentication using OTPs.
- [x] Single sign-on


[You can find the API documentation here.](https://github.com/sudoshreyansh/mfa-microservice/blob/main/Documentation.md)<br />
To view an example SSO server, developed using this microservice: [Check this repo!](https://github.com/sudoshreyansh/mfa-sso-server)

## Installation

Run `npm install` and create a `.env` file of the format:
```
OKTA_CLIENT_ID=<your okta client id>
OKTA_CLIENT_SECRET=<your okta client secret>
OKTA_TOKEN=<your okta client token>
OKTA_URI=<your okta url>
PORT=<preferred port>
```

and then run `node app.js` to run the microservice.

## Tech Stack

- Node JS
- Express JS
- OKTA SDK
