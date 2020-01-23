'use strict';

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class ServiceError extends Error {
	constructor(message, instance) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super();

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ServiceError);
		}

		this.name = 'ServiceError';
		this.type = !!instance && instance.name ? instance.name : 'unknown';
		this.message = message;
	}
}

module.exports = ServiceError;