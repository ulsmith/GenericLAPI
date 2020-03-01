'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');
const UserModel = require('../../Model/Identity/User.js');
const RegistrationModel = require('../../Model/Identity/Registration.js');
const Comms = require('../../Library/Comms.js');
const { YourAlreadyAUserHtml, YourAlreadyAUserText } = require('../../View/Email/User/YourAlreadyAUser.js');
const { RegistrationHtml, RegistrationText } = require('../../View/Email/User/Registration.js');
const { RegistrationActivateHtml, RegistrationActivateText } = require('../../View/Email/Admin/RegistrationActivate.js');
const { RegistrationCompletedHtml, RegistrationCompletedText } = require('../../View/Email/Admin/RegistrationCompleted.js');
const { RegistrationCreatedHtml, RegistrationCreatedText } = require('../../View/Email/Admin/RegistrationCreated.js');

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

        return userModel.getAuthedFromIdentity(event.parsedBody.identity, event.parsedBody.identityType)
            .then((usr) => {
                if (usr && usr.uuid) return usr;

                return registrationModel.find({ identity: event.parsedBody.identity, identity_type: event.parsedBody.identityType })
                    .then((reg) => {
                        // already registered and under ten minutes, throw error
                        if (reg[0] && reg[0].token_sent && (Date.now() - (new Date(reg[0].token_sent)).getTime()) / 1000 < parseInt(this.$environment.TokenExpireSeconds)) throw new RestError('Please give ' + (this.$environment.TokenExpireSeconds / 60) + ' minutes between registraion requests.', 401);

                        let token = Crypto.encodeToken(event.parsedBody.identity);

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
                            identity_type: event.parsedBody.identityType,
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
                    emailData.link = this.$client.origin ? this.$client.origin.replace(/^\/|\/$/g, '') : this.$environment.HostAddress;
                    return comms.emailSend(event.parsedBody.identity, this.$environment.EmailFrom, 'Your Already a User!', YourAlreadyAUserHtml(emailData), YourAlreadyAUserText(emailData));
                }

                emailData.token = this.$client.origin && event.parsedBody.route ? this.$client.origin.replace(/^\/|\/$/g, '') + '/' + event.parsedBody.route.replace(/^\/|\/$/g, '') + '/' + data : this.$environment.HostAddress + '/account/register/' + data
                return comms.emailSend(event.parsedBody.identity, this.$environment.EmailFrom, 'Welcome Abord', RegistrationHtml(emailData), RegistrationText(emailData));
            })
            .then(() => {
                if (config.emailAdminRegistrationCreated) {
                    // TODO: [Paul] config.email ... event.parsedBody.identity, event.parsedBody.identityType
                    // email admin to say new user created, but waiting to verify, get eithe ractivate or completed once done
                    console.log(1111111);
                }
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
                active: this.$services.config.get('registration').autoActivateUser,
                userIdentity: [{ identity: reg.identity, type: reg.identity_type }],
                userAccount: { password: reg.password }
            }).then(() => reg))
            .then((reg) => registrationModel.delete(reg.id).then(() => reg))
            .then((reg) => {
                // TODO: [Paul]
                let config = this.$services.config.get('admin');
                
                if (!config.autoActivateUser && config.emailAdminRegistrationActivate) {
                    // email admin to activate... config.email
                    console.log(1111);
                }
                
                if (config.emailAdminRegistrationCompleted) {
                    // email admin to say completed, but dont if needs activating as that is completing...  config.email
                    console.log(2222);
                }
            })
            .then(() => (
                this.$services.config.get('registration').autoActivateUser
                ? { body: 'Registration verified, user is now active', statusCode: 201 }
                : { body: 'Registration verified, user requires activation by admin', statusCode: 200 }
            ))
            .catch((error) => {
                if (error.name === 'RestError') throw error;
                else if (error.name === 'TokenExpiredError') throw new RestError('Registration token expired', 401);
                throw new RestError('Registration verify failed', 400);
            });
    }
}

module.exports = Registration;