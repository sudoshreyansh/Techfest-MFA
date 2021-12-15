All data is transmitted in the form of JSON.

# Authentication

### `POST` : /api/register

**Description:** Creates a new user in the Okta Global Directory and then enrolls the user with Email Multi-Factor Authentication on the same email. It generates an OTP sent via email to confirm the email address. The OTP remains valid for 5 mins.

**Request:**
```js
{
    firstName: string,
    lastName: string,
    email: string,
    password: string
}
```

**Response:**

```js
{
    userId: string
}
```


### `POST` : /api/activate

**Description:** Verifies the OTP sent during MFA enrollment, and activates Multi-Factor Authentication. If the request is sent without `otp`, it re-enrolls the user with the MFA and resends the OTP.

**Request:**
```js
{
    userId: string,
    otp: string
}
```

**Response:**

```js
{
    success: Boolean
}
```

### `POST` : /api/login

**Description:** It verifies the user credentials, and returns a session. In case the user has not verified the email through the OTP sent during MFA enrollment, instead of session details, the user id is returned.

**Request:**
```js
{
    email: string,
    password: string
}
```


**Response:**

MFA is not activated:<br>
```js
{
    userId: string
}
```

MFA activated:<br>
https://developer.okta.com/docs/reference/api/sessions/#session-object



### `POST` : /api/mfa/verify

**Description:** Used for Multi-Factor Authentication. If sent without `otp`, it sends an OTP to the registered email. If `otp` is present, it verifies the OTP.

**Request:**
```js
req:
{
    userId: string,
    otp: string
}
```
**Response:**

```js
{
    success: Boolean
}
```


### `POST` : /api/logout

**Description:** Destroys the session with the `sessionId`

**Request:**
```js
{
    sessionId: string;
}
```

**Response:**

```js
{
    success: Boolean
}
```

### `GET` : /api/user

**Description:** Returns the user data of the user belonging to the session.

```js
sessionId: string
```

**Response:**<br>
https://developer.okta.com/docs/reference/api/users/#user-object

# Single Sign-On

### `POST` : /api/sso/grant

**Description:** Generates an authorization code which acts as the authorization grant while implementing Single Sign-On based on the OpenID Connect Authorization Code Flow.

```js
{
    sessionId: string
}
```

**Response:**<br>
```js
{
    code: string
}
```

### `POST` : /api/sso/token

**Description:** Generates an ID token of the user corresponding to the Authorization Grant for SSO. The ID token is a JWT, with the user's profile as the payload. It expires in 10 hrs. The token is encrypted using HS256 algorithm.

```js
{
    code: string
}
```

**Response:**<br>
```js
{
    token: string
}
```

### `POST` : /api/sso/verify

**Description:** Verifies the ID token, and returns the decoded user's profile.

```js
{
    token: string
}
```

**Response:**<br>
`profile` of the User object from Okta: https://developer.okta.com/docs/reference/api/users/#user-object


# Errors

In case of any errors either from the microservice or from Okta, an error object is returned.

**Error Object:**
```js
{
    error: "ERROR_CODE",
    ....
}
```

The possible `error` values:
- `VALIDATION_ERROR`: The request data passed is invalid. More helpful details from Joi validator are added.

- `OKTA_ERROR`: The error is an error from the Okta API / SDK. The Okta error object is added to the object.

- `SERVER_ERROR`: Any unknown server error occured.

- `404`: Endpoint doesn't exist
