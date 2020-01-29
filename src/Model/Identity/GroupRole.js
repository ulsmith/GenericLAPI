'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class GroupRole
 * @extends Model
 * @description Model class for identity.group_role table
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
		super('identity.group_role');
    }
}

module.exports = GroupRole;