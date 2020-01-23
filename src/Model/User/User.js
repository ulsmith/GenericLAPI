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
     * @description Get user data from UUID of user
     * @param {String} guid The GUID to search for
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	getFromUUID(guid) {
		// return new Promise((resolve, reject) => {
		// 	this.db.query('SELECT * FROM user WHERE guid = ?', [guid], (error, results) => {
		// 		if (error) return reject(error);
		// 		return resolve(results[0]);
		// 	});
		// });
	}

    /**
     * @public @method getFromUUID
     * @description findFromCredentials
     * @param {String} username The username to search for
     * @param {String} password The password to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	getFromCredentials(username, password) {
		return this.db
			.select('user.user.*', 'user.user_account.*')
			.from('user.user')
			.join('user.user_account', 'user.user.id', 'user.user_account.user_id')
			.where('user.user_account.email', 'p@ulsmith.net')
			.limit(1)
			.then((data) => data[0] || undefined);
	}
}

module.exports = User;