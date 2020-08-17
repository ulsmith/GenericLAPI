'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/Dbduck/Public
 * @class EmailBlocked
 * @extends Model
 * @description Model class for public.email_blocked table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class EmailBlocked extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super('database_name', 'public.email_blocked');
	}
}

module.exports = EmailBlocked;