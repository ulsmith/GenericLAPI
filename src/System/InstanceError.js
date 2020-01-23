'use strict';

/**
 * @namespace API/System
 * @class InstanceError
 * @extends Error
 * @description System class to give extended error functionality as an instance error
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class InstanceError extends Error {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 * @param {String} message The message to pass in as the error message
	 * @param {Mixed} instance The instantiated instance of a class
	 */
	constructor(message, instance) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super();

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) Error.captureStackTrace(this, InstanceError);

		this.name = 'InstanceError';
		this.type = !!instance && instance.constructor && instance.constructor.name ? instance.constructor.name : 'unknown';
		this.message = message;
	}
}

module.exports = InstanceError;