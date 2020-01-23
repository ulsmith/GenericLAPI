'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/User
 * @class User
 * @extends Model
 * @description Model class for user.user table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class User extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor () {
		super('user.user');
	}

    /**
     * @public @method getFromUUID
     * @description Get user data from UUID of user, pushed direct to UI
     * @param {String} guid The GUID to search for
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	getAuthedFromUUID(uuid) {
		return this.db
			.select(
				'user.user.uuid',
				'user.user_account.email',
				'user.user_account.login_current',
				'user.user_account.login_previous'
			)
			.from('user.user')
			.join('user.user_account', 'user.user.id', 'user.user_account.user_id')
			.where('user.user.uuid', uuid)
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getAuthedFromEmail
     * @description Get authed user for logging in
     * @param {String} username The username to search for
     * @param {String} password The password to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	getAuthedFromEmail(username, password) {
		return this.db
			.select(
				'user.user.id',
				'user.user.uuid',
				'user.user_account.email',
				'user.user_account.password',
				'user.user_account.login_current',
				'user.user_account.login_previous'
			)
			.from('user.user')
			.join('user.user_account', 'user.user.id', 'user.user_account.user_id')
			.where('user.user_account.email', 'p@ulsmith.net')
			.limit(1)
			.then((data) => data[0] || undefined);
	}
}

module.exports = User;