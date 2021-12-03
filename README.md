# Techfest-MFA

Submission for Techfest MFA.

## Installation

Run `npm install` and create a `.env` file of the format:
```
OKTA_CLIENT_ID=<your okta client id>
OKTA_CLIENT_SECRET=<your okta client secret>
OKTA_URI=<your okta url>
BASE_URI=<your microservice url>
MONGODB_URI=<your mongodb instance url>
SESSION_SECRET=<session secret>
PORT=3000
JWT_PRIVATE_KEY_LOCATION=<file location for JWT private key>
```

and then run `node app.js` to run the microservice.
