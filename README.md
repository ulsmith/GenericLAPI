# Introduction

A API for GENERIC, a lambda stack using cloud formation to deply AWS services.

All data on the API is stored in s3 buckets with encrytion that can be turned on or off.

# Setup

This system uses SAM to create, run locallly and deploy to AWS. All commands are done with the default AWS user authenticated on your system, unless you set up more than one user in your credentials file and use --profile to select it.

Visit https://docs.aws.amazon.com/serverless-application-model/index.html to get SAM up and running.

# Running

To run the local api for lambda, run the following to make the lambda functions expose themselves...

`sam local start-api --profile your-user-account`

This will create a local serving of the application stack that can talk to AWS resources. The stack will normally be served @ http://127.0.0.1:3000

# Development

Developing in the app is done by the way of MVC style, template.yaml holds the routes (API Gateway) with controllers, models with the absence of a view, as all repsonses are REST and JSON.

We also have middleware, to allow for system wide changes, authentication, header changes etc.

## Importing from node or third party libraries

You can import from node directly using 

`const FS = require('fs');` to import file sysytem tools from node

`const Request = require('request-promise-native');` to import from a third party npm installed library, in this case 'request', a simple node request handler to send http requests. 

# Using

The system is split into three endpoints (all running on own lambds)

__definition:__ What drives the canvas, what modules to show on it and how to show them.
__payload:__ Any resulting data captured from the canvas, encrypted if required and stored on S3.
__upload:__ Any resulting uploaded files to accompany the payload.

Varying different endpoints are available on the endpoints such as GET, PUT... and so on.

## Authentication

First we only allow certain origins by way of a whitelist on the API.

In order to access any functionality on the system, you must supply and role permisson keys for the access you wish. These are held in teh template file and should be baked into the JWT.

### Fully Authenticated

Authentication comes in the way of a JWT that needs to be signed with the same key on the API. The aud or iss in the JWT must also match the origin header.

In this mode the two bits of info are placed in the JWT.

### Anonymous

Authentication happens by means of verifying an origin is safe to write a payload, if so, then handshaking ties the session with a self generated JWT to ensure data only comes from that instance of canvas.

This mode is onyl usable by the canvas system and not by direct access to the API

## Endpoints

There are three endpoints on the API.

### Definition

http://example/definition/standard-form

__GET:__ GET a definition by key "standard-form"
__PUT:__ PUT a new definition with key "standard-form"
__PATCH:__ PATCH an existing definition that has key "standard-form"
__DELETE:__ DELETE an existing definition that has key "standard-form"
__POST:__ POST multi-function request on definition using post data, such as list, dump etc...

### Payload

http://example/payload/standard-form

__GET:__ GET a payload by key "standard-form"
__PUT:__ PUT a new payload with key "standard-form"
__PATCH:__ PATCH an existing payload that has key "standard-form"
__DELETE:__ DELETE an existing payload that has key "standard-form"
__POST:__ POST multi-function request on payload using post data, such as list, dump etc...

### Upload

http://example/upload/standard-form

__GET:__ GET an upload by key "standard-form"
__PUT:__ PUT a new upload with key "standard-form"
__PATCH:__ PATCH an existing upload that has key "standard-form"
__DELETE:__ DELETE an existing upload that has key "standard-form"
__POST:__ POST multi-function request on upload using post data, such as list, dump etc...

## JWT

The JWT is hte heart of the authentication and requires certain data.

```json
{
	"iss": "http://example.net",
	"aud": "http://the-api-server-address.com",
	"iat": 123456789,
	"nbf": 123456789,
	"exp": 123456789,
	"identifier": "695B9B31-9CD9-478B-AA41-AE22152B1D83",
	"permissionDefinitionRead": "hfdhfsdkjnef43432kjljoifd34392jfbv.fdsfd",
	"permissionPayloadRead": "hfdhfsdkjnef43432kjljoifd34392jfbv.fdsfd"
}
```

iss -> the fully qualified domain of the origin (your server)
aud -> the fully qualified domain of target (the api)
iat -> issued at should be current tiemstamp in seconds
nbf -> not before should be current tiemstamp in seconds
exp -> expiry should be current tiemstamp in seconds + an amount that you wish the token to stay alive such as 5 days in seconds
identifier -> Unique reference for the session your on, such as GUID
permissionDefinitionRead -> The permission key to get access to this
permissionDefinitionWrite -> The permission key to get access to this
permissionDefinitionDelete -> The permission key to get access to this
permissionDefinitionList -> The permission key to get access to this
permissionPayloadRead -> The permission key to get access to this
permissionPayloadWrite -> The permission key to get access to this
permissionPayloadDelete -> The permission key to get access to this
permissionPayloadList -> The permission key to get access to this
permissionUploadRead -> The permission key to get access to this
permissionUploadWrite -> The permission key to get access to this
permissionUploadDelete -> The permission key to get access to this
permissionUploadList -> The permission key to get access to this

## Example

An example of hitting the endpoint with PHP, this can be done in any languague or system that can make REST style requests...

The JWT_KEY has to match the key on the API server

```php
	// GET A PAYLOAD
	$jwt_data = [
		'iss' => 'http://' . $_SERVER['HTTP_HOST'],
		'aud' => 'http://the-api-server-address.com',
		'iat' => time(),
		'nbf' => time(),
		'exp' => time() + 6000, // expire in 60 seconds (one shot jwt)
		'identifier' => '695B9B31-9CD9-478B-AA41-AE22152B1D83',
		'reference' => 'advert-id-123456',
		'permissionPayloadRead' => 'hfdhfsdkjnef43432kjljoifd34392jfbv.fdsfd'
	];

	// JWT creation
	$jwt = JWT::encode($jwt_data, JWT_KEY);
	$origin = "http://{$_SERVER['HTTP_HOST']}";

	// Create a stream
	$opts = [
		'http' => [
			'method' => "GET",
			'header' => "Authorization: Bearer {$jwt}\r\n" .
						"Accept: application/json\r\n" .
						"Cache-Control: no-cache\r\n" .
						"Origin: {$origin}\r\n"
		]
	];

	// Open the file using the HTTP headers set above
	$context = stream_context_create($opts);
	$data = file_get_contents("http://the-api-server-address.com/payload/standard-form", false, $context);

```
