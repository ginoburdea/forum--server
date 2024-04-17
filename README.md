## Installation

```bash
# Make sure you have node and npm installed (https://nodejs.org/en)

# clone the repository
git clone ... forum

# cd into the repository
cd forum

# copy the .env.example file to .env and set the environment variables
cp .env.example .env

# install the dependencies
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# development - watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrating the database

```bash
# You can optionally add a .env file that will contain the required environment variables
# See Installation section for more info

# generate a migration based on the updated .entity.ts files
$ npm run migration:generate --name=MigrationName

# generate an empty migration
$ npm run migration:create --name=MigrationName

# run the migrations
$ npm run migration:run

# revert the last migration
$ npm run migration:revert
```
