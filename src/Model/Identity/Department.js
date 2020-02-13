'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class Department
 * @extends Model
 * @description Model class for identity.department table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Department extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super('identity.department');
	}

	/**
	 * @public @method getDetails
	 * @description Get a single resource with accompanying table data
     * @param {Number} id The resource id to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	get(id) {
		// get authed details to override get and include information on logged in user to data
		let userId = this.$services.auth.user.id;
		let orgId = this.$services.auth.organisation.id;

		return this.db
			.select(
				'department.*',
				this.db.raw('COALESCE("organisation"."id"::boolean, false) AS "user_in_organisation"'),
				this.db.raw('COALESCE("user_department"."user_id"::boolean, false) AS "user_in_department"')
			)
			.from('identity.department')
			.leftJoin('identity.organisation', function () { this.on('department.organisation_id', '=', 'organisation.id').andOn('department.organisation_id', '=', orgId) })
			.leftJoin('identity.user_department', function () { this.on('department.id', '=', 'user_department.department_id').andOn('user_department.user_id', '=', userId) })
			.where({ 'department.id': id })
			.limit(1);
	}
}

module.exports = Department;