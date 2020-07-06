'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/Dbduck/Identity
 * @class Registration
 * @extends Model
 * @description Model class for identity.registration table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Registration extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('dbduck', 'identity.registration');
	}

    /**
	 * @public @get @method columns
	 * @description Columns that we allow to be changed through requests to API
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			identity: { type: 'string', required: true, description: 'User identity' },
			type: { type: 'enum[email][phone]', required: true, description: 'User identity type' },
			password: { type: 'string', required: true, description: 'User password' }
		};
	}
}

module.exports = Registration;