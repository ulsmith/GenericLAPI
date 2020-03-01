'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');
const Comms = require('../../Library/Comms.js');
const UserModel = require('../../Model/Identity/User.js');
const UserIdentityModel = require('../../Model/Identity/UserIdentity.js');
const UserAccountModel = require('../../Model/Identity/UserAccount.js');
const { PasswordResetHtml, PasswordResetText } = require('../View/Email/User/PasswordReset.js');

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
	 * @public @static @get post
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
    static get post() { return 'public' }

	/**
	 * @public @static @get get
	 * @desciption Get the access level for the post method. All methods are restricted by default.
	 * @return {Object} Object of access levels for methods
	 */
    static get patch() { return 'public' }

    /**
     * @public @method post
     * @description Log in to the back end with a post request
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
    post(event, context) {
        if (!event.parsedBody || !event.parsedBody.identity || !event.parsedBody.identityType) throw new RestError('We could not send your reset, please try again.', 401);
        if (['email', 'phone'].indexOf(event.parsedBody.identityType) < 0) throw new RestError('Reset details incorrect, please try again.', 400);

        let userModel = new UserModel();
        let userAccount = new UserAccountModel();

        return userModel.getAuthedFromIdentity(event.parsedBody.identity, event.parsedBody.identityType)
            .then((usr) => {
                // check user in db
                if (!usr) throw new RestError('Reset details incorrect, please try again.', 400);
                // check user is active
                if (!usr.active) throw new RestError('User is not active, please try again later.', 400);
                // Need to flood prevent here too
                if ((Date.now() - (new Date(usr.password_reminder_sent)).getTime()) / 1000 < parseInt(this.$environment.TokenExpireSeconds)) throw new RestError('Please give ' + (this.$environment.TokenExpireSeconds / 60) + ' minutes between reset requests.', 401);

                return usr;
            })
            .then((usr) => {
                return userAccount.update(usr.id, {
                    password_reminder: Crypto.encodeToken(usr.uuid),
                    password_reminder_sent: new Date()
                }, ['password_reminder']).then((usa) => [usr, usa[0]]);
            })
            .then((data) => {
                // send email out
                let comms = new Comms();

                // configure
                comms.emailConfigure(
                    this.$environment.EmailHost,
                    this.$environment.EmailPort,
                    this.$environment.EmailSecureWithTls,
                    this.$environment.EmailUsername,
                    this.$environment.EmailPassword
                );

                let emailData = {
                    systemName: this.$environment.HostName,
                    systemUrl: this.$environment.HostAddress,
                    name: data[0].name,
                    token: this.$client.origin && event.parsedBody.route
                        ? this.$client.origin.replace(/^\/|\/$/g, '') + '/' + event.parsedBody.route.replace(/^\/|\/$/g, '') + '/' + data[1].password_reminder
                        : this.$environment.HostAddress + '/account/reset/' + data[1].password_reminder
                };

                return comms.emailSend(event.parsedBody.identity, this.$environment.EmailFrom, 'Password Reset', PasswordResetHtml(emailData), PasswordResetText(emailData));
            })
            .then(() => 'Password reset')
            .catch((error) => {
                if (error.name === 'RestError' && error.statusCode === 401) throw error;
                throw new RestError('Password reset failed', 400);
            });
    }

    /**
     * @public @method patch
     * @description Update password using token as autentication
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
    patch(event) {
        if (!event.pathParameters.token || !event.parsedBody.identity || !event.parsedBody.identityType || !event.parsedBody.password) throw new RestError('Password reset failed', 401);
        if (['email', 'phone'].indexOf(event.parsedBody.identityType) < 0) throw new RestError('Reset details incorrect, please try again.', 400);

        let userModel = new UserModel();
        let userIdentity = new UserIdentityModel();
        let userAccount = new UserAccountModel();

        return Promise.resolve().then(() => Crypto.decodeToken(event.pathParameters.token))
            .then((uuid) => userModel.getAuthedFromUUID(uuid))
            .then((usr) => userIdentity.find({ user_id: usr.id, identity: event.parsedBody.identity, type: event.parsedBody.identityType }))
            .then((usr) => {
                if (usr[0].identity !== event.parsedBody.identity) throw new RestError('Reset details incorrect, please try again.', 401)
                return userAccount.update({ user_id: usr[0].user_id }, { password: Crypto.passwordHash(event.parsedBody.password) })
            }).then(() => 'Password reset successfully')
            .catch((error) => {
                if (error.name === 'TokenExpiredError') throw new RestError('Password reset token expired', 401);
                throw new RestError('Password reset failed', 400);
            });
    }
}

module.exports = Reset;