'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');
const UserModel = require('../../Model/Identity/User.js');
const Comms = require('../../Library/Comms.js');
const { YourActivatedHtml, YourActivatedText } = require('../../View/Email/User/YourActivated.js');

/**
 * @namespace API/Controller/Account
 * @class Activate
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Activate extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();

        // send email out
        this.comms = new Comms();
        this.comms.emailConfigure(
            this.$environment.EmailHost,
            this.$environment.EmailPort,
            this.$environment.EmailSecureWithTls,
            this.$environment.EmailUsername,
            this.$environment.EmailPassword
        );
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
                key = Crypto.decodeToken('activate', event.pathParameters.token, this.$environment.JWTKey, this.$environment.AESKey);
            })
            .then(() => userModel.getAuthedFromIdentity(key, 'email'))
            .then((usr) => {
                if (!usr || !usr.uuid) throw new RestError('We could not activate this user, please try again.', 401);
                return usr;
            })
            .then((usr) => userModel.update(usr.id, { active: true }))
            .then(() => {
                // send email out
                let emailData = {
                    systemName: this.$environment.HostName,
                    systemUrl: this.$environment.HostAddress,
                    identity: key,
                    identityType: 'email'
                };

                return this.comms.emailSend(key, this.$environment.EmailFrom, 'Your Activated', YourActivatedHtml(emailData), YourActivatedText(emailData));
            })
            .then(() => 'User Activated')
            .catch((error) => {
                console.log(error);
                if (error.name === 'RestError') throw error;
                else if (error.name === 'TokenExpiredError') throw new RestError('Activate token expired', 401);
                throw new RestError('Activate activation failed', 400);
            });
    }
}

module.exports = Activate;