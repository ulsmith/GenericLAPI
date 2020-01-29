'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class DepartmentRole
 * @extends Model
 * @description Model class for identity.department_role table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class DepartmentRole extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super('identity.department_role');
    }
}

module.exports = DepartmentRole;