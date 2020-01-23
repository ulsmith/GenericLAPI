'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/User
 * @class UserAccount
 * @extends Model
 * @description Model class for user.user_account table
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
		super('user.user_account');
	}
}

module.exports = UserAccount;