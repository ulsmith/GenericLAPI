'use strict';

const Controller = require('../../System/Controller.js');
const RestError = require('../../System/RestError.js');
const Crypto = require('../../Library/Crypto.js');
const UserModel = require('../../Model/Dbduck/Identity/User.js');
const RegistrationModel = require('../../Model/Dbduck/Identity/Registration.js');
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

        // send email out
        this.comms = new Comms();
        this.comms.emailConfigure(
            this.$environment.EMAIL_HOST,
            this.$environment.EMAIL_PORT,
            this.$environment.EMAIL_SECURE_WITH_TLS,
            this.$environment.EMAIL_USERNAME,
            this.$environment.EMAIL_PASSWORD
        );
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
                        if (reg[0] && reg[0].token_sent && (Date.now() - (new Date(reg[0].token_sent)).getTime()) / 1000 < parseInt(this.$environment.TOKEN_EXPIRE_SECONDS)) throw new RestError('Please give ' + (this.$environment.TOKEN_EXPIRE_SECONDS / 60) + ' minutes between registraion requests.', 401);
                        
                        let token = Crypto.encodeToken(
                            'registration', 
                            event.parsedBody.identity, 
                            this.$environment.HOST_ADDRESS, 
                            this.$client.origin, 
                            this.$environment.TOKEN_EXPIRE_SECONDS, 
                            this.$environment.JWT_KEY, 
                            this.$environment.AES_KEY
                        );
                   
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
                let emailData = { systemName: this.$environment.HOST_NAME, systemUrl: this.$environment.HOST_ADDRESS, expireTime: Number(this.$environment.TOKEN_EXPIRE_SECONDS) / 60 }

                if (data && data.uuid) {
                    emailData.name = data.name
                    emailData.link = this.$client.origin ? this.$client.origin.replace(/^\/|\/$/g, '') : this.$environment.HOST_ADDRESS;
                    return this.comms.emailSend(event.parsedBody.identity, this.$environment.EMAIL_FROM, 'Your Already a User!', YourAlreadyAUserHtml(emailData), YourAlreadyAUserText(emailData));
                }
                
                emailData.token = this.$client.origin && event.parsedBody.registerRoute ? this.$client.origin.replace(/^\/|\/$/g, '') + '/' + event.parsedBody.registerRoute.replace(/^\/|\/$/g, '') + '/' + data : this.$environment.HOST_ADDRESS + '/account/register/' + data
                return this.comms.emailSend(event.parsedBody.identity, this.$environment.EMAIL_FROM, 'Welcome Abord', RegistrationHtml(emailData), RegistrationText(emailData));
            })
            .then(() => {             
                if (this.$services.config.get('registration').emailAdminRegistrationCreated) {
                    let emailData = { 
                        systemName: this.$environment.HOST_NAME, 
                        systemUrl: this.$environment.HOST_ADDRESS,
                        identity: event.parsedBody.identity,
                        identityType: event.parsedBody.identityType
                    };
                    
                    return this.comms.emailSend(this.$services.config.get('admin').email, this.$environment.EMAIL_FROM, 'Registration Created', RegistrationCreatedHtml(emailData), RegistrationCreatedText(emailData));
                }
            })
            .then(() => 'Registration sent')
            .catch((error) => {
                console.log(error);
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

        return Promise.resolve().then(() => Crypto.decodeToken('registration', event.pathParameters.token, this.$environment.JWT_KEY, this.$environment.AES_KEY))
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
                // send email out
                let configAdmin = this.$services.config.get('admin');
                let configReg = this.$services.config.get('registration');

                if (!configReg.autoActivateUser && configReg.emailAdminRegistrationActivate) {
                    let data = Crypto.encodeToken('activate', reg.identity, this.$environment.HOST_ADDRESS, this.$client.origin, this.$environment.ACTIVATE_EXPIRE_SECONDS, this.$environment.JWT_KEY, this.$environment.AES_KEY);

                    let emailData = {
                        systemName: this.$environment.HOST_NAME,
                        systemUrl: this.$environment.HOST_ADDRESS,
                        identity: reg.identity,
                        identityType: reg.identity_type,
                        token: this.$client.origin && event.parsedBody.activateRoute ? this.$client.origin.replace(/^\/|\/$/g, '') + '/' + event.parsedBody.activateRoute.replace(/^\/|\/$/g, '') + '/' + data : this.$environment.HOST_ADDRESS + '/account/register/' + data
                    };

                    return this.comms.emailSend(configAdmin.email, this.$environment.EMAIL_FROM, 'Registration Activate', RegistrationActivateHtml(emailData), RegistrationActivateText(emailData));
                }
                
                if (configReg.emailAdminRegistrationCompleted) { 
                    let emailData = {
                        systemName: this.$environment.HOST_NAME,
                        systemUrl: this.$environment.HOST_ADDRESS,
                        identity: event.parsedBody.identity,
                        identityType: event.parsedBody.identityType
                    };

                    return this.comms.emailSend(reg.identity, this.$environment.EMAIL_FROM, 'Registration Completed', RegistrationCompletedHtml(emailData), RegistrationCompletedText(emailData));
                }
            })
            .then(() => (
                this.$services.config.get('registration').autoActivateUser
                ? { body: JSON.stringify({ message: 'Registration verified, please log in' }), statusCode: 201 }
                : { body: JSON.stringify({ message: 'Registration verified, user requires activation by admin' }), statusCode: 200 }
            ))
            .catch((error) => {
                if (error.name === 'RestError') throw error;
                else if (error.name === 'TokenExpiredError') throw new RestError('Registration token expired', 401);
                throw new RestError('Registration verify failed', 400);
            });
    }
}

module.exports = Registration;