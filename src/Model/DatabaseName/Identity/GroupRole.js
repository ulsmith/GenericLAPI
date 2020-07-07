'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/DatabaseName/Identity
 * @class GroupRole
 * @extends Model
 * @description Model class for identity.group__role table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class GroupRole extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('database_name', 'identity.group__role');
    }
}

module.exports = GroupRole;