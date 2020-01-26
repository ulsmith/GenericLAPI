'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');

/**
 * @namespace API/Controller/Account
 * @class Refresh
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Refresh extends Controller {

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
        if (!event.parsedBody || !event.parsedBody.token) throw new RestError('We could not refresh your token, please try again.', 401);

        return { token: this.$services.auth.refresh(event.parsedBody.token) };
	}
}

module.exports = Refresh;
