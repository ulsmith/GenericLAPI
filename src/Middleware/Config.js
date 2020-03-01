'use strict';

const Middleware = require('../System/Middleware.js');

/**
 * @namespace API/Middleware
 * @class Auth
 * @extends Middleware
 * @description Middleware class providing authentication actions in all incomming requests
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Config extends Middleware {

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
		return this.$services.config.cache();
	}
}

module.exports = Config;
