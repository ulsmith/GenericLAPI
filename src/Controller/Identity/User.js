'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const UserModel = require('../../Model/Identity/User.js');
const UserIdentityModel = require('../../Model/Identity/UserIdentity.js');

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

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.identity.user.other', 'read');

		let user = new UserModel();

		return user.getDetailsFromUUID(event.pathParameters.uuid)
			.then((user) => ({
				uuid: user.uuid,
				name: user.name,
				active: user.active,
				identities: user.identities,
			})).catch((error) => {
				throw new RestError('Could not find resource for UUID provided', 400);
			});
	}

    /**
     * @public @method post
     * @description Post (create) a brand new record at this resource
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return {Promise} Response promise resolved or rejected
     */
	post(event, context) {
		// no path parameter allowed for post
		if (event.pathParameters.uuid) throw new RestError('Method not allowed with UUID route parameter', 405);

		// check permissions for access, throws rest error on failure.
		this.$services.auth.hasPermission('api.identity.user.other', 'write');

		let user = new UserModel();
		let uMapped = user.mapDataToColumn(event.parsedBody);
		let userIdentity = new UserIdentityModel();
		let uiMapped = userIdentity.mapDataToColumn(event.parsedBody.userIdentity);
		// console.log(72, uiMapped); // single... { identity: 'fsdf@fsdfsd.fsdom', type: 'email', primary: false }
		// console.log(73, uiMapped); // many... [ { identity: 'fsdf@fsdfsd.fsdom', type: 'email', primary: false }, {identity: '333fsdf@fsdfsd.fsdom', type: 'email', primary: true} ]

/*
		{
			name: 'fsdfsfd'
			userIdentity: [
				{
					identity: 'fdsfsd',
					type: 'email',
					primary: false
				}
			]
		}
*/

		return user.insert(uMapped, '*')

		// need to merge in user id's
			.then((usrs) => userIdentity.insert(uiMapped, '*').then((ui) => {
				{
					uuid: usrs[0].uuid,
					name: usrs[0].name,
					active: usrs[0].active,
					userIdentity: ui
				}


				usrs[0].userIdentity = ui;
				return usrs[0];
			}))
			.then((usr) => ({
				uuid: usr.uuid,
				name: usr.name,
				active: usr.active
			}))
			.catch((error) => {
				throw new RestError({ message: 'Invalid data, could not add record', ...user.parseError(error) }, 400);
			});


// update user.name

		// // knex.transaction(function (trx) {
		// // 	knex('books').transacting(trx).insert({ name: 'Old Books' })
		// // 		.then(function (resp) {
		// // 			var id = resp[0];
		// // 			return someExternalMethod(id, trx);
		// // 		})
		// // 		.then(trx.commit)
		// // 		.catch(trx.rollback);
		// // })
		// // 	.then(function (resp) {
		// // 		console.log('Transaction complete.');
		// // 	})
		// // 	.catch(function (err) {
		// // 		console.error(err);
		// // 	});


		// return user.insert(mapped)
		// 	.then((result) => ({'message': 'Inserted record'}))
		// 	.catch((error) => { 
		// 		throw new RestError({message: 'Invalid data, could not add record', ...user.parseError(error)}, 400);
		// 	});
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

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.identity.user.other', 'write');

		// let user = new UserModel();
		// let mapped = user.mapDataToColumn(event.parsedBody);

		// return user.getFromUUID(event.pathParameters.uuid)
		// 	.then((usr) => { 
		// 		if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided', ...user.parseError()}, 404);
		// 		return usr;
		// 	})
		// 	.then((usr) => user.update(usr.id, mapped))
		// 	.then(() => ({ 'message': 'Updated record'}))
		// 	.catch((error) => {
		// 		if (error.name === 'RestError') throw error;
		// 		throw new RestError({ message: 'Invalid request, could not update record', ...user.parseError(error)}, 400);
		// 	});
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

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.identity.user.other', 'write');

		// // check partial dataset
		// let user = new UserModel();
		// let mapped = user.mapDataToColumn(event.parsedBody, true);

		// return user.getFromUUID(event.pathParameters.uuid)
		// 	.then((usr) => {
		// 		if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided', ...user.parseError() }, 404);
		// 		return usr;
		// 	})
		// 	.then((usr) => user.update(usr.id, mapped))
		// 	.then(() => ({ 'message': 'Updated record' }))
		// 	.catch((error) => {
		// 		if (error.name === 'RestError') throw error;
		// 		throw new RestError({ message: 'Invalid request, could not update record', ...user.parseError(error) }, 400);
		// 	});
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
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.identity.user.other', 'delete');

		// // check partial dataset
		// let user = new UserModel();

		// return user.getFromUUID(event.pathParameters.uuid)
		// 	.then((usr) => {
		// 		if (!usr.id) throw new RestError({ message: 'Could not find resource for UUID provided', ...user.parseError() }, 404);
		// 		return usr;
		// 	})
		// 	.then((usr) => user.delete(usr.id))
		// 	.then(() => ({ 'message': 'Deleted record' }))
		// 	.catch((error) => {
		// 		if (error.name === 'RestError') throw error;
		// 		throw new RestError({ message: 'Invalid request, could not delete record', ...user.parseError(error) }, 400);
		// 	});
	}
}

module.exports = User;
