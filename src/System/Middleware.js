'use strict';

const Core = require('./Core.js');

/**
 * @namespace API/System
 * @class Middleware
 * @extends Core
 * @description System class to give a base for creating middleware, exposing services and base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Middleware extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}
	
    /**
	 * @public @method invoke
	 * @description Invoke middleware for incomming events or outgoing responses
     * @param {Object} event The incoming event form API Gateway
     * @param {Object} context The lambda context
     * @param {Mixed} response The response object going back out the system to API gateway (if outgoing)
     */
	invoke(event, context, response) {
		// incoming only
		if (!!this.in && !response) this.in(event, context);
		if (!!this.out && !!response) this.out(response, context);
	}
}

module.exports = Middleware;