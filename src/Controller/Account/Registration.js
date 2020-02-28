'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');

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
        if (!event.parsedBody || !event.parsedBody.identity || !event.parsedBody.identityType || !event.parsedBody.password) throw new RestError('We could not register you, please try again.', 400);
        if (['email', 'phone'].indexOf(event.parsedBody.identityType) < 0) throw new RestError('Reset details incorrect, please try again.', 400);
        
        let userModel = new UserModel();
        let registrationModel = new RegistrationModel();

        return userModel.getAuthedFromIdentity(event.parsedBody.identity, identityType)
            .then((usr) => {
                if (usr && usr.uuid) return usr;

                return registrationModel.find({ identity: event.parsedBody.identity, identity_type: identityType })
                    .then((reg) => {
                        // already registered and under ten minutes, throw error
                        if (reg[0] && reg[0].token_sent && (Date.now() - (new Date(reg[0].token_sent)).getTime()) / 1000 < parseInt(this.$environment.TokenExpireSeconds)) throw new RestError('Please give ' + (this.$environment.TokenExpireSeconds / 60) + ' minutes between registraion requests.', 401);

                        let token = Crypto.encodeToken(event.parsedBody.identity);
                        // NOTE: [Paul remove me]
                        // Setting, need to decide if email should go to me
                        // Email, user has registered
                        // Setting, how do we activate, auto or I do it
                        // if auto, just add message to login page
                        // EMail, if i need to activate, show them message saying wait for activation, should be email link to me which should show users data 
                        // Email, if i activated, email them back when I have activated

                        // move all user stuff out of auth and into controllers apart form auth stuff

                        // need purge registration when moved over to user

                        // need a admin screen for me to manager users
                        // need a admin screen for me to purge registrations table

                        console.log(token);
                        if (reg[0]) {
                            return registrationModel.update(reg[0].id, {
                                password: Crypto.passwordHash(event.parsedBody.password),
                                token: token,
                                token_sent: new Date(),
                                ip_address: event.requestContext.identity.sourceIp,
                                user_agent: event.requestContext.identity.userAgent
                            }).then(() => token);
                        }

                        return registrationModel.insert({
                            identity: event.parsedBody.identity,
                            identity_type: identityType,
                            password: Crypto.passwordHash(event.parsedBody.password),
                            token: token,
                            token_sent: new Date(),
                            ip_address: event.requestContext.identity.sourceIp,
                            user_agent: event.requestContext.identity.userAgent
                        }).then(() => token);
                    })
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

                let emailData = { systemName: this.$environment.HostName, systemUrl: this.$environment.HostAddress }

                if (data && data.uuid) {
                    emailData.name = data.name
                    emailData.link = event.headers.Origin ? event.headers.Origin.replace(/^\/|\/$/g, '') : this.$environment.HostAddress;
                    return comms.emailSend(event.parsedBody.identity, this.$environment.EmailFrom, 'Your Already a User!', YourAlreadyAUserHtml(emailData), YourAlreadyAUserText(emailData));
                }

                emailData.token = event.headers.Origin && event.parsedBody.route ? event.headers.Origin.replace(/^\/|\/$/g, '') + '/' + event.parsedBody.route.replace(/^\/|\/$/g, '') + '/' + data : this.$environment.HostAddress + '/account/register/' + data
                return comms.emailSend(event.parsedBody.identity, this.$environment.EmailFrom, 'Welcome Abord', RegistrationHtml(emailData), RegistrationText(emailData));
            })
            .then(() => 'Registration sent')
            .catch((error) => {
                if (error.name === 'RestError') throw error;
                throw new RestError('Could not send registration', 400);
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
        if (!event.pathParameters.token || !event.parsedBody.identity || !event.parsedBody.identityType) throw new RestError('We could not register you, please try again.', 401);
        if (['email', 'phone'].indexOf(event.parsedBody.identityType) < 0) throw new RestError('Reset details incorrect, please try again.', 400);
        
        let registrationModel = new RegistrationModel();
        let userModel = new UserModel();

        return Promise.resolve().then(() => Crypto.decodeToken(event.pathParameters.token))
            .then((key) => { if (key !== event.parsedBody.identity) throw RestError('Registration token incorrect, please try again.', 401) })
            .then(() => registrationModel.find({ identity: event.parsedBody.identity, identity_type: event.parsedBody.identityType, token: event.pathParameters.token }).then((regs) => {
                if (!regs || !regs[0] || !regs[0].identity) throw RestError('Registration token incorrect, please try again.', 401);
                return regs[0];
            }))
            .then((reg) => userModel.getAuthedFromIdentity(event.parsedBody.identity, event.parsedBody.identityType).then((usr) => {
                if (usr && usr.uuid) throw new RestError('User is already present on the system', 401);
                return reg;
            }))
            .then((reg) => userModel.add({
                name: reg.identity,
                userIdentity: [{ identity: reg.identity, type: reg.identity_type }],
                userAccount: { password: reg.password }
            }))
            .then(() => 'Registration verified successfully')
            .catch((error) => {
                if (error.name === 'RestError') throw error;
                else if (error.name === 'TokenExpiredError') throw new RestError('Registration token expired', 401);
                throw new RestError('Registration verify failed', 400);
            });
    }
}

module.exports = Registration;