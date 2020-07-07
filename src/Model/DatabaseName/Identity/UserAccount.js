'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/DatabaseName/Identity
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
		super('database_name', 'identity.user_account');
	}

    /**
	 * @public @get @method columns
	 * @description Columns that we allow to be changed through requests to API
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			password: { type: 'string', required: true, description: 'User password' }
		};
	}

	/**
	 * @public @method getFromUUID
	 * @description Get a single resource in a single table by table id
     * @param {String} uuid The resource uuid to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	getFromUUID(uuid) { 
		return this.db
			.select('identity.user_account.*')
			.from('identity.user_account')
			.join('identity.user', 'user.id', 'user_account.user_id')
			.where('user.uuid', uuid).limit(1).then((data) => data[0]);
	}
}

module.exports = UserAccount;