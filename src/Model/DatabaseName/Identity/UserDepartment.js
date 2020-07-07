'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/DatabaseName/Identity
 * @class UserDepartment
 * @extends Model
 * @description Model class for identity.user__department table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class UserDepartment extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('database_name', 'identity.user__department');
	}
}

module.exports = UserDepartment;