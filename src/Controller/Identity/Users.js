'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const UserModel = require('../../Model/Identity/User.js');

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

		// return user.getDetailsFromUUID(event.pathParameters.uuid)
		// 	.then((usr) => {
		// 		if (!usr || !usr.id) throw new RestError('Could not find resource for UUID provided', 404);
		// 		return usr;
		// 	})
		// 	.then((usr) => {
		// 		if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usr;

		// 		// not same user, need to check permissions further, related org or all permission
		// 		if (usr.organisation && usr.organisation.indexOf(this.$services.auth.organisation.uuid) >= 0) this.$services.auth.isPermitted('api.identity.user.organisation/system', 'read');
		// 		else this.$services.auth.isPermitted('api.identity.user.system', 'read');
				
		// 		return usr;
		// 	})	
		// 	.then((usr) => ({
		// 		uuid: usr.uuid,
		// 		name: usr.name,
		// 		active: usr.active,
		// 		userIdentity: usr.user_identity,
		// 	})).catch((error) => {
		// 		if (error.name === 'RestError') throw error;
		// 		throw new RestError('Could not find resource for UUID provided', 404);
		// 	});
	}
}

module.exports = Users;
