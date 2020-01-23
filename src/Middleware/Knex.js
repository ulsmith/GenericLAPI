'use strict';

const Middleware = require('../System/Middleware.js');

/**
 * @namespace API/Middleware
 * @class Knex
 * @extends Middleware
 * @description Middleware class providing knex DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Knex extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

    /**
	 * @public @method out
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     * @param {Object} context The lambda context
     */
	out(response, context) {
		return this.$services.knex.destroy();
	}
}

module.exports = Knex;