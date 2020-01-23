'use strict';

var KnexService = require('./src/Service/Knex.js');
var AuthService = require('./src/Service/Auth.js');

var KnexMiddleware = require('./src/Middleware/Knex.js');
var AuthMiddleware = require('./src/Middleware/Auth.js');
var CorsMiddleware = require('./src/Middleware/Cors.js');

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

	// preset a response, preset default headers
	var response = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }, statusCode: 200, body: JSON.stringify({})};

	// is this a cors options request?
	if (event.httpMethod.toLowerCase() === 'options') {
		// build up response
		Cors.invoke(event, response);
		return callback(null, response);
	}

    // no route found, through 404
    if (!!((event.pathParameters || {}).error || false)) return callback(null, { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('404 Not Found [' + event.pathParameters.error + ']')});
    
	// Get Resource and UCWORDS it end_point > EndPoint
    let resource = event.resource.split('/');

	// parse resource to name and path 
    let path = '', name = ''; 
    for (let i = 1; i < resource.length; i++) {
        if (!!resource[i] && resource[i].charAt(0) === '{') continue;
        name += resource[i].replace('_', '-').replace(/\b[a-z]/g, (char) => { return char.toUpperCase() });
        path += resource[i].replace('_', '-').replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }) + '/';
    }
    path = path.substring(0, path.length -1) + '.js';

    // load controller
    let controller = {};
    try {
        controller[name] = require('./src/Controller/' + path);
    } catch (error) {
        if (process.env.Mode === 'development') console.log(error);
        return callback(null, { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('404 Not Found [' + event.resource + ']') });
    }
	
	// we are pretty much ready now, so lets set up some singleton services that can hold state accross the system
	process.__client = {
		origin: event.headers.Origin 
	};

	process.__services = {
		knex: new KnexService(),
		auth: new AuthService()
	};

	process.__middleware = {
		auth: new CorsMiddleware(),
		knex: new KnexMiddleware(),
		auth: new AuthMiddleware(),
	};

    // lets parse over any body
	event.parsedBody = !!event.body && event.headers['Content-Type'] === 'application/json' ? event.parsedBody = JSON.parse(event.body) : {};

	// incoming middleware invoke, catch rest errors and return for things like failed auth
	try {
		for (const name in process.__middleware) process.__middleware[name].invoke(event, context, null);
	} catch (error) {
		if (error.name === 'RestError') return callback(null, { statusCode: error.code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(error.message) });
		throw new Error(error);
	}
	
	// strip out params to array
	event.params = [];
	if (!!event.pathParameters) event.params = event.pathParameters.params.split('/');
	    
    // call controller and wrap in try to ensure all errors captured in promise stack
	let promise;
	try {
    	promise = new controller[name]()[event.httpMethod.toLowerCase()](event, context);
	} catch (error) {
		promise = Promise.reject(error);
	}

	// prepare output, log build errors to console
	promise.then((payload) => {
        // build up response
        response.statusCode = !!payload.statusCode ? payload.statusCode : 200;
		if (!!payload.headers) response.headers = Object.assign({}, response.headers, payload.headers);
		response.body = !!payload.body ? payload.body : JSON.stringify(payload);

		return response;
	}).catch((error) => {
		if (error.name !== 'RestError') console.log(error);

        // build up response
        response.statusCode = error.name === 'RestError' ? error.statusCode : 500;
        response.body = JSON.stringify(error.name === 'RestError' ? error.message : error);

		return response;
	}).then((response) => {
		// outgoing middleware
		try {
			for (const name in process.__middleware) process.__middleware[name].invoke(event, context, response);
		} catch (error) {
			if (error.name === 'RestError') return callback(null, { statusCode: error.code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(error.message) })
		}
		
		// return callback to AWS
		callback(null, response);
	});
}