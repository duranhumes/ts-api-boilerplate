# TS-API-Boilerplate

This was built mainly as a boilerplate but I also explored other things like encryption, user account validation, and went deeper into docker.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites

Node.js, npm, npx, Docker, and docker-compose. Create a `.env` file and copy the template from `.env.example` and fill in all of the variables.

## Installing

A step by step series of examples that tell you how to get a development env running

* Run `yarn` in the base directory to install deps.
* Then run `yarn start` to start the app.
* done.

There are a few endpoints *see* `src/server.ts`

`/_healthz` **->** `GET /` returns status of the server

`/users` **->** 
* `GET /:userid` **->** returns the users information found by id
* `GET /me` **->** returns the current logged in users information
* `POST /` **->** creates a user with the following `{ userName, email, password }` and sends an account confirmation email *see* `src/services/UserService.ts` 
    * *password also has requirements see* `src/entities/User/index.ts`
* `PATCH /:userid` **->** updates a user i.e. `{ userName: 'another one' }`
* `DELETE /:userid` **->** deletes a user found by the `userid`
* **A user can only edit / delete their own account, and must be logged in**

`/login` **->** `POST /` logs in a user with the following `{ email, password }` also requires a user to have confirmed their account otherwise a `403` error will be thrown

`/logout` **->** `POST /` logs out a user

`/verify` **->** `GET /` requires a query param `value=jwt-token......` the link that was sent to the users email when their account was created will have the verify link. The account must be verified.

## Running the tests

* Run `yarn test` for basic tests
* Run `yarn test:cov` for tests with coverage

## Deployment

Recommend setup would be to run `yarn prod` which will build the code to js and run with pm2 a cluster manager *see* `ecosystem.config.js` for pm2 settings. This should be behind a reverse proxy like nginx, caddy, apache.
