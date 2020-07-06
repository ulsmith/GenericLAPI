'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const ConfigurationModel = require('../../Model/Dbduck/Public/Configuration.js');

/**
 * @namespace API/Controller/Identity
 * @class Configuration
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Configuration extends Controller {

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
		this.$services.auth.isPermitted('api.system.configuration', 'read');

		let configuration = new ConfigurationModel();
		
		return configuration.find({ 'key': event.pathParameters.key })
			.then((rows) => {
				if (rows.length !== 1) throw Error('Resource not found');
				return rows[0].value;
			})
			.catch((error) => {
				throw new RestError('Could not find resource for key provided', 404);
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
		// check permissions for access, throws rest error on failure. system level access only
		this.$services.auth.isPermitted('api.system.configuration', 'read,write');

		let configuration = new ConfigurationModel();

		return configuration.find({ 'key': event.pathParameters.key })
			.then((rows) => {
				if (rows.length === 1) throw new RestError('Resource already exists, could not add record', 400);
			})
			.then(() => configuration.insert({ key: event.pathParameters.key, value: event.parsedBody }, '*'))
			.then((rows) => rows[0].value)
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Invalid data, could not add record', 400);
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
		this.$services.auth.isPermitted('api.system.configuration', 'read,write');

		let configuration = new ConfigurationModel();

		return configuration.find({ 'key': event.pathParameters.key })
			.then((rows) => {
				if (rows.length !== 1) throw Error('Resource not found');
				return rows[0];
			})
			.then((row) => configuration.update(row.id, { value: event.parsedBody }, '*'))
			.then((rows) => rows[0].value)
			.catch((error) => {
				console.log(error);
				if (error.name === 'RestError') throw error;
				throw new RestError('Invalid request, could not update record', 400);
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
		this.$services.auth.isPermitted('api.system.configuration', 'write');

		let configuration = new ConfigurationModel();

		return configuration.find({ 'key': event.pathParameters.key })
			.then((rows) => {
				if (rows.length !== 1) throw Error('Resource not found');
				return rows[0];
			})
			.then((row) => configuration.update(row.id, { value: { ...row.value, ...event.parsedBody }}))
			.then(() => 'Updated record')
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Invalid request, could not update record', 400);
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
		this.$services.auth.isPermitted('api.system.configuration', 'delete');

		// check partial dataset
		let configuration = new ConfigurationModel();

		return configuration.find({ 'key': event.pathParameters.key })
			.then((rows) => {
				if (rows.length !== 1) throw Error('Resource not found');
				return rows[0];
			})
			.then((row) => configuration.delete(row.id))
			.then(() => 'Deleted record')
			.catch((error) => {
				if (error.name === 'RestError') throw error;
				throw new RestError('Invalid request, please use a valid key to delete this resource', 400);
			});
	}
}

module.exports = Configuration;