### POST : /register

Description : This EndPoint will create a new Activated user and enroll into Multi-Factor Authentication

```js
req :
{
    firstName: string,
    lastName: string,
    email: string (email),
    password: string
}
```

### POST : /activate

Description: Used to activate the Multi-Factor Authentication and verify the user email using OTP

```js
req :
{
userId: string,
otp: string
}
```

### POST : /login

Description: This end point will login the user and Create a session to users application. In case factor is not Activated the User will receive the UserID

```js
req :
{
email: string(email),
password: string
}
```

### POST : /MFA/verify

Description: Used to verify the user on the Application using OTP sent to the registered email Id

```js
req :
{
userId: string,
otp: string
}
```

### POST : /logout

Description: Used to distroy the user session for the application and Logout

```js
req:
{
  sessionId: string;
}
```

### GET : /user

Description: Used to get the user data from the OKTA server

```js
req:
{
  sessionId: string;
}
```
