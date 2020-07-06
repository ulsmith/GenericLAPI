'use strict';

const Model = require('../../../System/Model.js');

/**
 * @namespace API/Model/Dbduck/Health
 * @class Health
 * @extends Model
 * @description Model class for checking system health
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Health extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor () {
		super('dbduck');
	}

    /**
     * @public @method health
     * @description Ping the db to check availability
     * @return Promise a response from db service
     */
	getHealth() {
		return this.db.raw("SELECT 'healthy' AS status").then((data) => data.rows[0]);
	}
}

module.exports = Health;