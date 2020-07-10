'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const UserModel = require('../../Model/DatabaseName/Identity/User.js');

/**
 * @namespace API/Controller/Identity
 * @class Users
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Users extends Controller {

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
		this.$services.auth.isPermitted('api.identity.user', 'read');

		let user = new UserModel();

		return user.getAllDetails()
			.then((users) => {
				// empty
				if (users && users.length < 0) return usr;

				// only system access allowed for this
				this.$services.auth.isPermitted('api.identity.user.system', 'read');

				return users;
			})
			.then((users) => users.map((usr) => ({
				id: usr.id,
				name: usr.name,
				active: usr.active,
				userIdentity: usr.user_identity.map((ui) => ({
					identity: ui.identity,
					type: ui.type,
					primary: ui.primary
				}))
			}))).catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Could not find resource for ID provided', 404);
			});
	}
}

module.exports = Users;
