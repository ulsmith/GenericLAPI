'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');

/**
 * @namespace API/Controller/Account
 * @class Reset
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Reset extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

	/**
	 * @public @static @get get
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
    static get patch() { return 'public' }

	/**
	 * @public @static @get post
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
    static get post() { return 'public' }

    /**
     * @public @method patch
     * @description Update password using token as autentication
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
    patch(event) {
        if (!event.pathParameters.token || !event.parsedBody.identity || !event.parsedBody.identityType || !event.parsedBody.password) throw new RestError('Password reset failed', 401);

        // process reset request
        return this.$services.auth.processReset(
            event.pathParameters.token,
            event.parsedBody.identity,
            event.parsedBody.identityType,
            event.parsedBody.password
        ).then(() => 'Password reset successfully').catch((error) => {
            if (error.name === 'TokenExpiredError') throw new RestError('Password reset token expired', 401);
            throw new RestError('Password reset failed', 400);
        });
    }

    /**
     * @public @method post
     * @description Log in to the back end with a post request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
    post(event, context) {
        if (!event.parsedBody || !event.parsedBody.identity || !event.parsedBody.identityType) throw new RestError('We could not send your reset, please try again.', 401);

        return this.$services.auth.sendReset(event.parsedBody.identity, event.parsedBody.identityType).then(() => {
            return 'Password reset'
        }).catch((error) => {
            if (error.name === 'RestError' && error.statusCode === 401) throw error;
            throw new RestError('Password reset failed', 400);
        });
	}
}

module.exports = Reset;


