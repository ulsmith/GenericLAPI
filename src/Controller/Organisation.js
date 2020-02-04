'use strict';

const Controller = require('../System/Controller.js');
const RestError = require('../System/RestError.js');
const OrganisationModel = require('../Model/Identity/Organisation.js');

/**
 * @namespace API/Controller
 * @class Organisation
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Organisation extends Controller {

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
		this.$services.auth.hasPermission('api.crud.organisation', 'read');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.crud.organisation.other', 'read');

		let organisation = new OrganisationModel();
		
		return organisation.getFromUUID(event.pathParameters.uuid)
			.then((org) => ({
				uuid: org.uuid,
				active: org.active,
				name: org.name,
				name_unique: org.name_unique,
				description: org.description
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
		this.$services.auth.hasPermission('api.crud.organisation.other', 'write');

		let organisation = new OrganisationModel();
		let mapped = organisation.mapDataToColumn(event.parsedBody);

		return organisation.insert(mapped)
			.then((result) => ({'message': 'Inserted record'}))
			.catch((error) => { 
				throw new RestError({message: 'Invalid data, could not add record', ...organisation.parseError(error)}, 400);
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
		this.$services.auth.hasPermission('api.crud.organisation', 'write');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.crud.organisation.other', 'write');

		let organisation = new OrganisationModel();
		let mapped = organisation.mapDataToColumn(event.parsedBody);

		return organisation.getFromUUID(event.pathParameters.uuid)
			.then((org) => { 
				if (!org.id) throw new RestError({ message: 'Could not find resource for UUID provided', ...organisation.parseError()}, 404);
				return org;
			})
			.then((org) => organisation.update(org.id, mapped))
			.then(() => ({ 'message': 'Updated record'}))
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError({ message: 'Invalid request, could not update record', ...organisation.parseError(error)}, 400);
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
		this.$services.auth.hasPermission('api.crud.organisation', 'write');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.crud.organisation.other', 'write');

		// check partial dataset
		let organisation = new OrganisationModel();
		let mapped = organisation.mapDataToColumn(event.parsedBody, true);

		return organisation.getFromUUID(event.pathParameters.uuid)
			.then((org) => {
				if (!org.id) throw new RestError({ message: 'Could not find resource for UUID provided', ...organisation.parseError() }, 404);
				return org;
			})
			.then((org) => organisation.update(org.id, mapped))
			.then(() => ({ 'message': 'Updated record' }))
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError({ message: 'Invalid request, could not update record', ...organisation.parseError(error) }, 400);
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
		this.$services.auth.hasPermission('api.crud.organisation', 'delete');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.crud.organisation.other', 'delete');

		// check partial dataset
		let organisation = new OrganisationModel();

		return organisation.getFromUUID(event.pathParameters.uuid)
			.then((org) => {
				if (!org.id) throw new RestError('Could not find resource for UUID provided', 404);
				return org;
			})
			.then((org) => organisation.delete(org.id))
			.then(() => ({ 'message': 'Deleted record' }))
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Invalid request, please use a valid uuid to delete this resource', 400);
			});
	}
}

module.exports = Organisation;
