'use strict';

var RestError = require('./src/System/RestError.js');

var KnexService = require('./src/Service/Knex.js');
var AuthService = require('./src/Service/Auth.js');
var ConfigService = require('./src/Service/Config.js');

var KnexMiddleware = require('./src/Middleware/Knex.js');
var AuthMiddleware = require('./src/Middleware/Auth.js');
var CorsMiddleware = require('./src/Middleware/Cors.js');
var ConfigMiddleware = require('./src/Middleware/Config.js');

/**
 * @namespace API
 * @method handler
 * @description System application handler, talking back to lambda to bridge LAPI with AWS
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
exports.handler = (event, context, callback) => {
	// correct any headers
	event.headers.Origin = event.headers.Origin || event.headers.origin;
	event.headers.Authorization = event.headers.Authorization || event.headers.authorization;
	event.headers['Content-Type'] = event.headers['Content-Type'] || event.headers['content-type'];
	event.pathParameters = event.pathParameters ? event.pathParameters : {};
	event.parsedBody = event.parsedBody ? event.parsedBody : {};

	// preset a response, preset default headers
	var response = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }, statusCode: 200, body: JSON.stringify({})};

	// no route found, through 404
    if (!!((event.pathParameters || {}).error || false)) {
		if (event.pathParameters.error) {
			event.resource = '/' + event.pathParameters.error;
		}
	}
		
	// Get Resource and UCWORDS it end_point > EndPoint
    let resource = event.resource.split('/');

	// parse resource to name and path 
    let path = '', name = ''; 
    for (let i = 1; i < resource.length; i++) {
        if (!!resource[i] && resource[i].charAt(0) === '{') continue;
		name += resource[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '');
		path += resource[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '') + '/';
    }
	path = path.substring(0, path.length -1) + '.js';
	
    // load controller
    let controller = {};
    try {
		controller[name] = require('./src/Controller/' + path);
		event.controller = { path: './src/Controller/' + path, name: name, access: controller[name][event.httpMethod.toLowerCase()]};
		if (event.pathParameters.error) return callback(null, { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('406 route based parameter/s missing') });
	} catch (error) {
		if (process.env.MODE === 'development') console.log(error);
        return callback(null, { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('404 Not Found [' + event.resource + ']') });
	}

	// lets parse over any body
	event.parsedBody = !!event.body && event.headers['Content-Type'] === 'application/json' ? event.parsedBody = JSON.parse(event.body) : {};

	// we are pretty much ready now, so lets set up some singleton services that can hold state accross the system
	process.__client = {
		origin: event.headers.Origin
	};

	process.__services = {
		knex: { database_name: new KnexService() },
		auth: new AuthService(),
		config: new ConfigService()
	};

	// start promise chain
	Promise.resolve()

	// incoming middleware, run synchronously as each one impacts on the next
	.then(() => new AuthMiddleware().in(event, context))
	.then(() => new ConfigMiddleware().in(event, context))
	
	// run controller and catch result
	.then(() => new controller[name]()[event.httpMethod.toLowerCase()](event, context))
	.catch((error) => {
		// look for method nto allowed first
		if (
			error.name.toLowerCase() === 'typeerror' 
			&& error.message.toLowerCase().indexOf('is not a function') > 0 
			&& error.message.toLowerCase().indexOf('event.httpmethod.tolowercase') > 0
		) throw new RestError('405 Method not allowed [' + event.httpMethod.toUpperCase() + ']', 405);
		else throw error;
	})
	.then((payload) => {
        // build up response
        response.statusCode = !!payload.statusCode ? payload.statusCode : 200;
		if (!!payload.headers) response.headers = Object.assign({}, response.headers, payload.headers);
		response.body = !!payload.body ? payload.body : JSON.stringify(payload);

		return response;
	})
	.catch((error) => {
		// catch any other errors
		if (error.name !== 'RestError') console.log(error);

        // build up response
        response.statusCode = error.name === 'RestError' ? error.statusCode : 500;
        response.body = JSON.stringify(error.name === 'RestError' ? error.message : error);

		return response;
	})

	// outgoing middleware, run synchronously as each one impacts on the next
	.then(() => new KnexMiddleware().out(response, context))
	.then(() => new CorsMiddleware().out(response, context))

	// finally catch any last issues in middleware and output back to lambda
	.catch(() => error.name !== 'RestError' ? console.log(error) : undefined)
	.then(() => callback(null, response));
}
