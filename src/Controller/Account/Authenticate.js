'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');

/**
 * @namespace API/Controller/Account
 * @class Authenticate
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Authenticate extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

	/**
	 * @public @static @get post
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
    static get post() { return 'public' }

    /**
     * @public @method post
     * @description Log in to the back end with a post request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	post(event) {
        return this.$services.auth.login(
            event.parsedBody.identity, 
            event.parsedBody.identityType || 'email', 
            event.parsedBody.password, 
            event.parsedBody.organisationID, 
            event.requestContext.identity.userAgent,
            event.requestContext.identity.sourceIp
        );
	}

    /**
     * @public @method get
     * @description Ping the backend to check authentication
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event) {
        return {
            user: {
                id: this.$services.auth.user.id,
                name: this.$services.auth.user.name,
                identity: this.$services.auth.user.identity,
                identityType: this.$services.auth.user.identityType,
                loginCurrent: this.$services.auth.user.login_current,
                loginPrevious: this.$services.auth.user.login_previous
            },
            organisation: {
                id: this.$services.auth.organisation.id,
                name: this.$services.auth.organisation.name,
                nameUnique: this.$services.auth.organisation.name_unique,
                description: this.$services.auth.organisation.description
            },
            permissions: this.$services.auth.permissions.filter((perm) => perm.role.indexOf('ui.') === 0)
        };
	}
}

module.exports = Authenticate;
