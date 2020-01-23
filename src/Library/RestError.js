'use strict';

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class RestError extends Error {
	constructor(message, code) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super();

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RestError);
		}

		this.name = 'RestError';
		this.message = message;
		this.code = code;
	}
}

module.exports = RestError;