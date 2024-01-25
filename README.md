DEPRECATED 1/25/2024 https://topcoder.atlassian.net/browse/CORE-257

# Topcoder Leaderboard API

## Dependencies

- Nodejs (v10)
- AWS DynamoDB

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- API_VERSION: the API version
- CHALLENGE_API_URL: the Topcoder challenge API URL
- MEMBER_API_URL: the Topcoder member API URL
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- AMAZON.AWS_ACCESS_KEY_ID: The Amazon certificate key to use when connecting. For local dynamodb you can set fake value.
- AMAZON.AWS_SECRET_ACCESS_KEY: The Amazon certificate access key to use when connecting. For local dynamodb you can set fake value.
- AMAZON.AWS_REGION: The Amazon region to use when connecting. For local dynamodb you can set fake value.
- AMAZON.DYNAMODB_READ_CAPACITY_UNITS: the AWS DynamoDB read capacity units
- AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS: the AWS DynamoDB write capacity units
- AMAZON.IS_LOCAL_DB: Use local or AWS Amazon DynamoDB
- AMAZON.DYNAMODB_URL: The local url, if using local Amazon DynamoDB
- HEALTH_CHECK_TIMEOUT: health check timeout in milliseconds
- BUSAPI_URL: Topcoder Bus API URL
- KAFKA_ERROR_TOPIC: The error topic at which bus api will publish any errors
- KAFKA_MESSAGE_ORIGINATOR: The originator value for the kafka messages
- LEADERBOARD_CREATE_TOPIC: Kafka topic for create message
- LEADERBOARD_UPDATE_TOPIC: Kafka topic for update message
- LEADERBOARD_DELETE_TOPIC: Kafka topic for delete message
- LEADERBOARD_AGGREGATE_TOPIC: Kafka topic that is used to combine all create, update and delete message(s)

## Local DynamoDB
Change to the ./docker-dynamodb directory and run `docker-compose up`.
An instance of DynamoDB listening on port `8000` will be initialized inside docker.

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

- Make sure DynamoDB instance is up and create tables

```bash
npm run create-tables
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

## Verification
First of all, ensure you have started local DynamoDB and created tables.

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

- Run the following commands clear and insert test data, step up environment variables and start the app.

```bash
npm run init-db
npm run test-data
export CHALLENGE_API_URL=http://localhost:3001/challenges
export MEMBER_API_URL=http://localhost:3001/users
npm start
```

- Import the collection and environment into your POSTMAN app and run the test case from top to down.
