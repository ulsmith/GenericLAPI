'use strict';

// dependencies
var RestError = require('../Library/RestError.js');
var UploadModel = require('../Model/Upload.js');

/**
 * Two class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Upload {
    /**
     * GET request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event) {
		if (event.auth.permissionUploadRead !== process.env.PermissionUploadRead) throw new RestError('No permission to access this resource', 401);

		let host = event.params[0];
		let form = event.params[1];
		let filename = event.params[2];

		let upload = new UploadModel();
		return upload.preSignedUrl(host, form, filename);
    }

    /**
     * PUT request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	put(event) {
		if (event.auth.permissionUploadWrite !== process.env.PermissionUploadWrite) throw new RestError('No permission to access this resource', 401);

		// check type, size
		if (!event.parsedBody.type || ['image/jpeg', 'image/png'].indexOf(event.parsedBody.type) < 0) throw new RestError('Bad resource type, cannot push this type of file', 403);
		if (!event.parsedBody.size || event.parsedBody.size > 100000000) throw new RestError('Bad resource size, cannot push a file this size', 403);

		// if ok, then return a presigned URL for uploading
		let form = event.auth.aud.replace(/https:\/\/|http:\/\//g, '') + '/' + event.params[0];
		let upload = new UploadModel();
		
		return upload.preSignedPost(form, event.parsedBody, event.auth.aud);
    }
}

module.exports = Upload;