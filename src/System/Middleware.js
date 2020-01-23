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
}

module.exports = Middleware;