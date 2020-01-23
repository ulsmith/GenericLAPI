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

		// Athorization Header? public only access...
		if (!event.headers.Authorization) return;

		// get token bits
		let tokenParts = event.headers.Authorization.split(' ');

		// no bearer part
		if (tokenParts[0].toLowerCase() !== 'bearer' || !tokenParts[1]) throw new RestError('Malformed Token, invalid', 401);

		// dont even try to auth if path missing
		if (!event.pathParameters.params) throw new RestError('Path parameters not specified', 404);

		try {
			// check for anonymous user
			if (tokenParts[1] !== 'anonymous') throw new RestError('Failed to detect anonymous user', 401);

			// generate auth
			event['auth'] = {
				iss: 'api',
				aud: this.$client.origin,
				iat: Date.now() / 1000,
				nbf: Date.now() / 1000,
				exp: (Date.now() / 1000) + 432000,
				permissionDefinitionRead: this.$environment.PermissionDefinitionRead,
				permissionUploadWrite: this.$environment.PermissionUploadWrite
			}

			event.headers.Authorization = 'Bearer anonymous';
		} catch (error) {
			// next try JWT auth
			try {
				// validate token
				event['auth'] = jwt.verify(tokenParts[1], this.$environment.JWTKey);

				// the JWT must have been issued for the origin (aud > incoming from API/other), or from the origin (iss > incoming from service)
				if (event.auth.iss !== this.$client.origin && event.auth.aud !== this.$client.origin) throw new RestError('Origin has been changed, access denied', 401);

				// if first handshake or ten minutes since last one, recycle token
				if (event.auth.iss !== 'api' || event.auth.iat + 600 < Date.now() / 1000) {
					event.auth.iss = 'api';
					event.auth.iat = Date.now() / 1000;
					event.auth.nbf = Date.now() / 1000;
					event.auth.exp = (Date.now() / 1000) + 432000;
					event.headers.Authorization = 'Bearer ' + jwt.sign(event.auth, this.$environment.JWTKey);
				}
				
				// we always need a path to the def and indetifying params for auth mode with jwt
				if (!event.auth.identifier || !event.auth.reference) throw new RestError('Could allow access based on identifier and reference parameters', 403);
			} catch (error) {
				if (error.name === 'JsonWebTokenError') throw new RestError('Token is not valid, access denied', 401);
				if (error.name === 'TokenExpiredError') throw new RestError('Token has expired, access denied', 401);
				if (error.name === 'RestError') throw error;
				throw new RestError('Failed to authenticate token', 401);
			}
		}
	}
}

module.exports = Auth;