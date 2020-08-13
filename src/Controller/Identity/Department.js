'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const DepartmentModel = require('../../Model/DatabaseName/Identity/Department.js');

/**
 * @namespace API/Controller/Identity
 * @class Department
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Department extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

    /**
     * @public @method get
     * @description Get the resource from the backend by an identifier
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	get(event, context) {
		// check permissions for access, throws rest error on failure.
		this.$services.auth.isPermitted('api.identity.department', 'read');

		let department = new DepartmentModel();

		return department.get(event.pathParameters.id)
			.then((depts) => {
				if (!depts || depts.length < 1) throw new RestError('Could not find resource for ID provided', 404);
				return depts[0];
			})
			.then((dept) => {
				// check roles dependant on authed user
				if (dept.user_in_department) this.$services.auth.isPermitted('api.identity.department.department/organisation/system', 'read');
				else if (dept.user_in_organisation) this.$services.auth.isPermitted('api.identity.department.organisation/system', 'read');
				else this.$services.auth.isPermitted('api.identity.department.system', 'read');
				
				return dept;
			})	
			.then((dept) => ({
				id: dept.id,
				name: dept.name,
				nameUnique: dept.name_unique,
				description: dept.description,
				organisation: { id: dept.organisation_id }
			})).catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Could not find resource for ID provided', 404);
			});
	}
}

module.exports = Department;
