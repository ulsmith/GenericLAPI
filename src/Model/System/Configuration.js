'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/System
 * @class Configuration
 * @extends Model
 * @description Model class for system.configuration table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Configuration extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('system.configuration');
	}
}

module.exports = Configuration;