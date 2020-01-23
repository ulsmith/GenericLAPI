'use strict';

// dependencies
var Crypto = require('../Library/Crypto.js');
var RestError = require('../Library/RestError.js');
var PayloadModel = require('../Model/Payload.js');

/**
 * Two class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Payload {
    /**
     * GET request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event) {
		if (event.auth.permissionPayloadRead !== process.env.PermissionPayloadRead) throw new RestError('No permission to access this resource', 401);

		// generate identifying unique hash
		let key = event.auth.aud.replace(/https:\/\/|http:\/\//g, '') + '/' + event.params[0] + '/' + event.auth.reference;
		let hash = Crypto.md5(event.params[0] + event.auth.aud + event.auth.identifier + event.auth.reference);
		let payload = new PayloadModel();

		return payload.get(key, hash).catch(() => { throw new RestError('Failed to fetch the resource', 403) });
    }

    /**
     * PUT request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	put(event) {
		if (event.auth.permissionPayloadWrite !== process.env.PermissionPayloadWrite) throw new RestError('No permission to access this resource', 401);

		// generate identifying unique hash
		let key = event.auth.aud.replace(/https:\/\/|http:\/\//g, '') + '/' + event.params[0] + '/' + event.auth.reference;
		let hash = Crypto.md5(event.params[0] + event.auth.aud + event.auth.identifier + event.auth.reference);
		let payload = new PayloadModel();

		// first check if present, if not then upload it, only put if not present
		return payload.has(key, hash)
		.catch(() => payload.put(key, hash, event.body))
		.catch(() => { throw new RestError('Failed to save the resource', 403) })
		.then((data) => {
			if (typeof data === 'string') return data;
			throw new RestError('Resource already exists', 403);
		});
    }

    /**
     * PATCH request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	patch(event) {
		if (event.auth.permissionPayloadWrite !== process.env.PermissionPayloadWrite) throw new RestError('No permission to access this resource', 401);

		// generate identifying unique hash
		let key = event.auth.aud.replace(/https:\/\/|http:\/\//g, '') + '/' + event.params[0] + '/' + event.auth.reference;
		let hash = Crypto.md5(event.params[0] + event.auth.aud + event.auth.identifier + event.auth.reference);
		let payload = new PayloadModel();

		return payload.put(key, hash, event.body).catch(() => { throw new RestError('Failed to save the resource', 403) });
    }
}

module.exports = Payload;