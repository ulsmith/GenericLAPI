'use strict';

const Middleware = require('../System/Middleware.js');

// https://www.npmjs.com/package/jsonwebtoken
// push any auth related stuff back to service!!
var jwt = require('jsonwebtoken');
var RestError = require('../System/RestError.js');

/**
 * @namespace API/Middleware
 * @class Auth
 * @extends Middleware
 * @description Middleware class providing authentication actions in all incomming requests
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Auth extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

    /**
	 * @public @method in
	 * @description Invoke middleware for incomming event
     * @param {Object} event The incoming event form API Gateway
     * @param {Object} context The lambda context
     */
	in(event, context) {
		// incoming only
		if (!this.$client.origin) throw new RestError('Origin is not set, access denied', 401);

		// origin failed to auth to white list
		if (this.$environment.CorsWhitelist.replace(' ', '').split(',').indexOf(this.$client.origin) < 0) throw new RestError('Origin is not allowed, access denied', 401);

		// public access, do not authorize
		if (event.controller.access.public.indexOf(event.httpMethod.toLowerCase()) >= 0) return;
		
		// missing token
		if (!event.headers.Authorization) throw new RestError('Missing Authorization Token, invalid', 401);

		// get token bits
		if (event.headers.Authorization.split(' ')[0].toLowerCase() !== 'bearer') throw new RestError('Malformed Token due to missing "Bearer", invalid', 401);

		// verify against auth service, throws restError on failure
		return this.$services.auth.verify(event.headers.Authorization);
	}
}

module.exports = Auth;