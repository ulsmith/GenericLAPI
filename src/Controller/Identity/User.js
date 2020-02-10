'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const UserModel = require('../../Model/Identity/User.js');

/**
 * @namespace API/Controller/Identity
 * @class User
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class User extends Controller {

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
		this.$services.auth.hasPermission('api.identity.user', 'read');

		let user = new UserModel();

		return user.getDetailsFromUUID(event.pathParameters.uuid)
			.then((usr) => {
				if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usr;

				// not same user, need to check permissions further, related org or all permission
				if (usr.organisation && usr.organisation.indexOf(this.$services.auth.organisation.uuid) >= 0) this.$services.auth.hasPermission('api.identity.user.related', 'read');
				else this.$services.auth.hasPermission('api.identity.user.all', 'read');
				
				return usr;
			})	
			.then((usr) => ({
				uuid: usr.uuid,
				name: usr.name,
				active: usr.active,
				userIdentity: usr.user_identity,
			})).catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Could not find resource for UUID provided', 400);
			});
	}

    /**
     * @public @method post
     * @description Post (create) a brand new record at this resource, include meta table data
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	post(event, context) {
		// no path parameter allowed for post
		if (event.pathParameters.uuid) throw new RestError('Method not allowed with UUID route parameter', 405);

		// check permissions for access, throws rest error on failure.
		this.$services.auth.hasPermission('api.identity.user.all', 'write');
		
		let user = new UserModel();
		
		// add a new user, with all meta tables, handle any system errors
		return user.add(event.parsedBody).catch((error) => {
			if (error.name === 'SystemError') throw new RestError(error, 400);
			throw error;
		});
	}

    /**
     * @public @method put
     * @description Put (replace) an existing record with this one at this resource
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	put(event, context) {
		// check permissions for access, throws rest error on failure.
		this.$services.auth.hasPermission('api.identity.user', 'write');

		let user = new UserModel();

		// add a new user, with all meta tables, handle any system errors
		return user.getDetailsFromUUID(event.pathParameters.uuid)
			.then((usr) => {
				if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided' }, 404);
				return usr;
			})
			.then((usr) => {
				if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usr;

				// not same user, need to check permissions further, related org or all permission
				if (usr.organisation && usr.organisation.indexOf(this.$services.auth.organisation.uuid) >= 0) this.$services.auth.hasPermission('api.identity.user.related', 'read');
				else this.$services.auth.hasPermission('api.identity.user.all', 'read');

				return usr;
			})				
			.then((usr) => user.edit(usr.id, event.parsedBody))
			.catch((error) => {
				if (error.name === 'SystemError') throw new RestError(error, 400);
				throw error;
			});
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
		this.$services.auth.hasPermission('api.identity.user', 'write');

		let user = new UserModel();

		// add a new user, with all meta tables, handle any system errors
		return user.getDetailsFromUUID(event.pathParameters.uuid)
			.then((usr) => {
				if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided' }, 404);
				return usr;
			})
			.then((usr) => {
				if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usr;

				// not same user, need to check permissions further, related org or all permission
				if (usr.organisation && usr.organisation.indexOf(this.$services.auth.organisation.uuid) >= 0) this.$services.auth.hasPermission('api.identity.user.related', 'read');
				else this.$services.auth.hasPermission('api.identity.user.all', 'read');

				return usr;
			})			
			.then((usr) => user.edit(usr.id, event.parsedBody, true))
			.catch((error) => {
				if (error.name === 'SystemError') throw new RestError(error, 400);
				throw error;
			});
	}

    /**
     * @public @method delete
     * @description Delete the specified record from this resource
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	delete(event, context) {
		// check permissions for access, throws rest error on failure.
		this.$services.auth.hasPermission('api.identity.user', 'delete');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.user.uuid) this.$services.auth.hasPermission('api.identity.user.all', 'delete');

		// check partial dataset
		let user = new UserModel();

		return user.getFromUUID(event.pathParameters.uuid)
			.then((usr) => {
				if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided' }, 404);
				return usr;
			})
			.then((usr) => {
				if (event.pathParameters.uuid === this.$services.auth.user.uuid) return usr;

				// not same user, need to check permissions further, related org or all permission
				if (usr.organisation && usr.organisation.indexOf(this.$services.auth.organisation.uuid) >= 0) this.$services.auth.hasPermission('api.identity.user.related', 'read');
				else this.$services.auth.hasPermission('api.identity.user.all', 'read');

				return usr;
			})	
			.then((usr) => user.delete(usr.id))
			.then(() => ({ 'message': 'Deleted record' }))
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError({ message: 'Invalid request, could not delete record', ...user.parseError(error) }, 400);
			});
	}
}

module.exports = User;
