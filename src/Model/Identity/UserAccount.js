'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class UserAccount
 * @extends Model
 * @description Model class for identity.user_account table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class UserAccount extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor () {
		super('identity.user_account');
	}

    /**
	 * @public @get @method columns
	 * @description return columns for this model that we give access to
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			password: { type: 'string', required: true, description: 'User password' },
			ip_address: { type: 'cidr', required: false, description: 'Friendly organisation name' },
			user_agent: { type: 'string', required: false, description: 'Unique organisation name' },
			login_current: { type: 'timestamp', required: false, description: 'Basic short description of organisation' },
			login_previous: { type: 'timestamp', required: false, description: 'Basic short description of organisation' }
		};
	}
}

module.exports = UserAccount;