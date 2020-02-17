'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const UserAccountModel = require('../../Model/Identity/UserAccount.js');
const Crypto = require('../../Library/Crypto.js');

/**
 * @namespace API/Controller/Identity
 * @class User
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class UserAccount extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

    /**
     * @public @method patch
     * @description Patch (update) an existing record with these changes at this resource
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	patch(event, context) {
		// check permissions for access, throws rest error on failure.
		this.$services.auth.isPermitted('api.identity.user', 'read,write');

		let userAccount = new UserAccountModel();
		let uaMapped;

		// add a new user, with all meta tables, handle any system errors
		return Promise.resolve().then(() => {
				// map data, checking integrity
				uaMapped = userAccount.mapDataToColumn(event.parsedBody, true);
				uaMapped.password = Crypto.passwordHash(uaMapped.password);

				// to edit password you must have current password too
				if (!!event.parsedBody.password && !event.parsedBody.currentPassword) throw new RestError('Must include current password when changing password', 400);
			})
			.then(() => userAccount.getFromUUID(event.pathParameters.uuid).then((usracc) => {
				if (!usracc || !usracc.id) throw new RestError({ message: 'Could not find resource for UUID provided' }, 404);
				if (usracc.password !== Crypto.passwordHash(event.parsedBody.currentPassword, usracc.password.substring(0, usracc.password.length / 2))) throw new RestError('Current password is incorrect, unable to change password', 401);
				
				return usracc;
			}))
			.catch((error) => {
				// manage error, parse and re-throw
				if (error.name === 'SystemError') throw new RestError({
					message: error.message,
					userAccount: {
						...userAccount.columns,
						currentPassword: {
							"type": "string",
							"required": true,
							"description": "Current user password"
						}
					}
				}, 400);
				throw error;
			})
			.then((usracc) => {
				if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usracc;

				// not same user, need to check permissions further, related org or all permission
				this.$services.auth.isPermitted('api.identity.user.system', 'read,write');

				return usracc;
			})			
			.then((usracc) => userAccount.update(usracc.id, uaMapped))
			.then(() => 'Updated record')
			.catch((error) => {
				if (error.name === 'SystemError') throw new RestError(error, 400);
				throw error;
			});
	}
}

module.exports = UserAccount;
