# Topcoder Leaderboard API

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- Kafka (v2)
- Mongodb (v4)

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- MONGODB_URL: Mongo DB URL

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

- Start the express server

```bash
npm start
```

## Heroku Deployment

- git init
- git add .
- git commit -m init
- heroku create
- heroku config:set MONGODB_URL=...
- git push heroku master

## Verification

- Import the collection and environment into your POSTMAN app and check out the endpoints
