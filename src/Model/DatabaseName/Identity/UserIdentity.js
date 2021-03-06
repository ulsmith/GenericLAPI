'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/DatabaseName/Identity
 * @class UserIdentity
 * @extends Model
 * @description Model class for identity.user_identity table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class UserIdentity extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('database_name', 'identity.user_identity');
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
			primary: { type: 'boolean', required: false, description: 'User identity primary type' }
		};
	}
}

module.exports = UserIdentity;