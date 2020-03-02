'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');
const UserModel = require('../../Model/Identity/User.js');
const Comms = require('../../Library/Comms.js');
const { YourActivatedHtml, YourActivatedText } = require('../../View/Email/User/YourActivated.js');

/**
 * @namespace API/Controller/Account
 * @class Registration
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Registration extends Controller {

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
     * @public @method patch
     * @description Update password using token as autentication
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
    patch(event) {
        if (!event.pathParameters.token) throw new RestError('We could not activate this user, please try again.', 401);
        
        let userModel = new UserModel();
        let key;

        return Promise.resolve().then(() => {
                key = Crypto.decodeToken(event.pathParameters.token, this.$environment.AESKey);
            })
            .then(() => userModel.getAuthedFromIdentity(key, 'email'))
            .then((usr) => {
                if (usr && usr.uuid) throw new RestError('We could not activate this user, please try again.', 401);
                return reg;
            })
            .then((usr) => userModel.update(usr.id, { activate: true }, '*'))
            .then((usr) => {
                // send email out
                let comms = new Comms();
                let emailData = {
                    systemName: this.$environment.HostName,
                    systemUrl: this.$environment.HostAddress,
                    identity: key,
                    identityType: 'email'
                };

                return comms.emailSend(config.email, this.$environment.EmailFrom, 'Your Activated', YourActivatedHtml(emailData), YourActivatedText(emailData));
            })
            .then(() => 'User Acitvated')
            .catch((error) => {
                if (error.name === 'RestError') throw error;
                else if (error.name === 'TokenExpiredError') throw new RestError('Registration token expired', 401);
                throw new RestError('Registration activation failed', 400);
            });
    }
}

module.exports = Registration;