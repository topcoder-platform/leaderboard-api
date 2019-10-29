# Topcoder Leaderboard API

## Dependencies

- nodejs (v10)
- Mongodb (v4)

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- MONGODB_URL: Mongo DB URL
- CHALLENGE_API_URL: the Topcoder challenge API URL
- MEMBER_API_URL: the Topcoder member API URL
- GROUP_IDS: the valid group ids
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token

## Local deployment

- From the project root directory, run the following command to install the dependencies

```bash
npm i
```

- To run linters if required

```bash
npm run lint

npm run lint:fix # To fix possible lint errors
```

- Clear and Insert data into database

```bash
npm run init-db

npm run test-data
```

- Start the express server

```bash
npm start
```

## Mock API
For verification purpose, we need a mock app for Topcoder Challenge API and Topcoder Member API. You can run command `npm run mock-api` to start the mock app.

## Heroku Deployment

- git init
- git add .
- git commit -m init
- heroku create
- heroku config:set MONGODB_URL=...
- git push heroku master

## Verification

### Tests

- Run the following command to execute unit test and generate coverage report

```bash
npm run test
```

- Run the following command to execute e2e test and generate coverage report

```bash
npm run e2e
```

### Postman

- Start mock app and it will listen on 3001 PORT.

```bash
npm run mock-api
```

- Ensure you have start MongoDB and properly configure `MONGODB_URL`. Run the following commands to clear and insert test data, step up environment variables and start the app.

```bash
npm run init-db
npm run test-data
export CHALLENGE_API_URL=http://localhost:3001/challenges
export MEMBER_API_URL=http://localhost:3001/users
npm start
```

- Import the collection and environment into your POSTMAN app and run the test case from top to down.
