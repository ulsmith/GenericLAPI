'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/Dbduck/Identity
 * @class UserRole
 * @extends Model
 * @description Model class for identity.user__role table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class UserRole extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('dbduck', 'identity.user__role');
    }
}

module.exports = UserRole;