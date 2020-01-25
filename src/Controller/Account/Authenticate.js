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
		if (!event.parsedBody.username || !event.parsedBody.password) throw new RestError('We could not log you in, please try again.', 401);

        return this.$services.auth.login(event.parsedBody.username, event.parsedBody.password, event.requestContext.identity.sourceIp);
	}

    /**
     * @public @method get
     * @description Ping the backend to check authentication
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event) {
		if (!event.headers.Authorization) throw new RestError('We could not verify you, logging you out.', 401);

        return {user: this.$services.auth.user};
	}
}

module.exports = Authenticate;
