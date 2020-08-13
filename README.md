# Introduction

A FaaS Generic API for applications, using the AWS ecosystem. Written in javascript for node.

Create a Lambda/API Gateway/RDS/S3/??? stack using Cloud Formation to deply (SAM local) AWS services. Run the system locally, using docker (automatically) through the AWS sam cli tool and docker (required). Once deployed, the stack will split API Gateway endpoints into seperate lambda's.

Why use a stack? Its MVCS so your code makes sense. Its what your used to, but when deployed seperate lambda's are used and the full stack goes on each lambda.

Is this not a waste of reasources, making it slow? Not at all, controllers are loaded on the fly through dynamic require, loading only the dependencies in that specific chain. To put this another way, think of it like lazy loading the required files only. So this makes it pretty much the same speed as basic lambda's.

Get the familularity of MVCS, with the speed and flexibility of FaaS. There are also lots of other benefits, like a ready to go DB handler using Knex.js, promised based controllers, with a single application handler to bridge the system to the lambda callback.

Whats included?

Routing (SAM template.yaml)
Controllers
Middleware
Models
Services

All system files are available to create and extend the stack, with a library for your own helper classes.

Run locally with a simple `npm start`...
Build your AWS CF package with a simple `npm run build`...
Deploy your AWS CF package with a simple `npm run deploy`...

This system is initially set up to use postgres through Knex.js using the {pg} dependency for postgres. Alternatively you can reconfigure this setup to use {pg} Amazon Redshift, {mysql} MySQL or MariaDB, {sqlite3} SQLite3, or {mssql} MSSQL. Loading hte correct node package for them. thi sallows us to shift DB without having to change any model code.

Models in the system work differently to that of an ORM. ORM's have one main puprose for existing, abstaction of the DB to allow for easy change, without the need to rewrite code. We do away with the bloat of ORM, applying abstraction in the models, through custom functions that extend the model bas functions, with the DB abstraction happening direct at knex.js.

# Setup

This system uses SAM to create, run locallly and deploy to AWS. All commands are done with the default AWS user authenticated on your system, unless you set up more than one user in your credentials file and use --profile to select it.

Visit https://docs.aws.amazon.com/serverless-application-model/index.html to get SAM up and running.

Once complete, install all required deps using npm

`npm install`

# Running

The very first time you try to access the API locally, you will have a big delay, as docker pulls down the correct image to kick start the container used for simulating Lambda's.

All other requests will use this newly pulled image and should respond typically with a 2s ish latency.

To run the local api for lambda, run the following to make the lambda functions expose themselves...

First configure your package.json script for start. Once done run...

`npm start`

This will create a local serving of the application stack that can talk to AWS resources. The stack will normally be served @ http://127.0.0.1:3000

# Development

Developing in the app is done by the way of MVC style, template.yaml holds the routes (API Gateway) with controllers, models with the absence of a view, as all repsonses are REST and JSON.

We also have middleware, to allow for system wide changes, authentication, header changes etc.

## Importing from node or third party libraries

You can import from node directly using 

`const FS = require('fs');` to import file sysytem tools from node

`const Request = require('request-promise-native');` to import from a third party npm installed library, in this case 'request', a simple node request handler to send http requests. 

# Deploy

You first need to build your AWS CF package, to do so, configure your CLI command in the package.json file. Once complete, you may run...

`npm run build`

Finally push your build to production, once you have configured your CLI command in package.json

`npm run deploy`

# Migrations

place a script inside package.js "migrate": "node migration/migrate.mjs" 
place a script inside package.js "migrate:testing": "SERVER=testing node migration/migrate.mjs" 
place a script inside package.js "migrate:staging": "SERVER=staging node migration/migrate.mjs" 
place a script inside package.js "migrate:production": "SERVER=production node migration/migrate.mjs" 

NOTE: add :testing to run migrate.testing.json e.g. npm run migrate:testing -- health

@command npm run migrate -- prepare
@detail prepare a migrate file for migration (any folder inside migration folder, even the migration folder)

@command npm run migrate -- health
@detail run a health check on all databases

@command npm run migrate -- health db_name
@detail run a health check on specific database

@command npm run migrate -- list
@detail list all migrations on all databases

@command npm run migrate -- list db_name
@detail list all migrations on specific database

@command npm run migrate -- parse dbname filepath
@detail parse a specific file without tracking

@command npm run migrate -- up
@detail migrate all databases to latest migrations

@command npm run migrate -- down
@detail revert all migrations on all databases... this is very very dangerous and requires a code

@command npm run migrate -- up db_name
@detail migrate database to latest version

@command npm run migrate -- down db_name
@detail revert all migrations on database... this is very very dangerous and requires a code

@command npm run migrate -- up db_name 1593443102301
@detail migrate specific migration against specific database (safer, only runs against specific database) 

@command npm run migrate -- down db_name 1593443102301
@detail revert specific migration against specific database (safer, only runs against specific database, no code required) this is very very dangerous and requires a code

@command npm run migrate -- up db_name start:1593443102301
@detail migrate range starting at start or timestamp and ending at end or timestamp against specific database (safer, only runs against specific database) 

@command npm run migrate -- down db_name 1593443102301:end
@detail revert range starting at start or timestamp and ending at end or timestamp against specific database (safer, only runs against specific database, no code required) this is very very dangerous and requires a code