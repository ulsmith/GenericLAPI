'use strict';

const Controller = require('../System/Controller.js');
const RestError = require('../System/RestError.js');
const OrganisationModel = require('../Model/Identity/Organisation.js');

/**
 * @namespace API/Controller
 * @class Authenticate
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
     * @description Ping the system to check whats Organisation and whats not
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event, context) {
		// check permissions for access, throws rest error on failure.
		this.$services.auth.hasPermission('api.controller.123', 'read');

		// if not your logged in organisation, check access, throws rest error if not allowed
		if (event.pathParameters.uuid !== this.$services.auth.organisation.uuid) this.$services.auth.hasPermission('api.controller.xy4z', 'read') 

		let organisation = new OrganisationModel();
		
		return organisation.getFromUUID(event.pathParameters.uuid).then((org) => ({
			uuid: org.uuid,
			created: org.created,
			updated: org.updated,
			active: org.active,
			name: org.name,
			name_unique: org.name_unique,
			description: org.description,
		})).catch((error) => {
			throw new RestError('Invalid request, please check uuid is valid', 400);
		});
	}
}

module.exports = Organisation;
