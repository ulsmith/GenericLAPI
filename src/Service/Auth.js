'use strict';

const Service = require('../System/Service.js');
const RestError = require('../System/RestError.js');
const Crypto = require('../Library/Crypto.js');
const UserModel = require('../Model/Identity/User.js');
const UserAccountModel = require('../Model/Identity/UserAccount.js');
const JWT = require('jsonwebtoken');

/**
 * @namespace API/Service
 * @class Auth
 * @extends Service
 * @description Service class providing authentication functionality, accessable thorughout the application
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Auth extends Service {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();

		this.user;
	}

    /**
     * @public @method login
	 * @description Log a user in based on username and password
     * @param {String} username The resource to fetch with the given key
     * @param {String} password The resource to fetch with the given key
     * @param {String} ip The resource to fetch with the given key
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	login(username, password, userAgent) {
		let userModel = new UserModel();
		let userAccountModel = new UserAccountModel();

		return userModel.getAuthedFromEmail(username)
			.then((user) => {
				// NOTE: need to flood prevent here too
				if (!user) throw new RestError('Login details incorrect, please try again.', 401);
				if (user.password !== Crypto.passwordHash(password, user.password.substring(0, user.password.length / 2))) throw new RestError('Login details incorrect, please try again.', 401);
				if (!user.active) throw new RestError('User is not active, please try again later.', 401);
				
				return user;
			}).then((user) => {
				let date = new Date();

				// update user but return data from before update so last logged on correct
				return userAccountModel
					.update(user.id, { login_current: date, login_previous: user.login_current, user_agent: userAgent })
					.then((update) => ({
						uuid: user.uuid, 
						name: user.name,
						login_current: date, 
						login_previous: user.login_current
					}));
			}).then((user) => {
				// construct output and inject header
				return { token: this.generateJWT(user, userAgent), user: user };
			});
	}

    /**
     * @public @method verify
	 * @description Verify a user is still logged in. Has JWT expired?
     * @param {String} authorization The auth string from the request header, to verify
     * @return {Object} The user object to return if verified
     */
	verify(authorization, userAgent) {
		let payload;
		let jwt = authorization.replace('Bearer', '').trim();

		try {
			payload = this.verifyJWT(jwt);
		} catch(error) {
			if (error.name === 'TokenExpiredError') {
				throw new RestError({ 
					message: 'Authorization expired, please refresh expired token.', 
					method: 'POST', 
					url: this.$environment.JWTIssuer + '/account/refresh',
					body: {token: jwt}
				}, 401);
			}
			
			throw new RestError({
				message: 'Authorization failed, please log in to authorize.',
				method: 'POST',
				url: this.$environment.JWTIssuer + '/account/authenticate',
				body: { username: '', password: '' }
			}, 401);
		}

		// have we switched origins?
		if (payload.aud !== this.$client.origin) throw new RestError('Origin / Token missmatch, invalid', 401);
		if (payload.userAgent !== userAgent) throw new RestError('Client browser has changed, invalid', 401);

		let userModel = new UserModel();

		return userModel.getAuthedFromUUID(payload.uuid)
			.then((user) => {
				if (!user) throw new RestError('User not found, please try again.', 404);
				if (!user.active) throw new RestError('User is not active, please try again later.', 401);
				
				// cache user for system use
				this.user = user;

				// return basic user details when hit directly
				return { user: {
					uuid: user.uuid,
					name: user.name,
					login_current: user.login_current,
					login_previous: user.login_previodus
				}};
			}).then((stuff) => {


				return userModel.getAllPermisions(this.user.id, 1);


			}).then((perms) => {
				console.log(perms);

				return {
					user: {
						uuid: this.user.uuid,
						name: this.user.name,
						login_current: this.user.login_current,
						login_previous: this.user.login_previodus
					}
				};
			});
	}

    /**
     * @public @method refresh
	 * @description Verify a token is valid or expired, then refresh?
     * @param {String} authorization The auth string from the request header, to verify
     * @return {Object} The user object to return if verified
     */
	refresh(authorization) {
		let jwt = authorization.replace('Bearer', '').trim();

		try {
			// if verified, just refresh anyway
			if (this.verifyJWT(jwt)) return this.refreshJWT(jwt);
		} catch (error) {
			// if expired, refresh
			if (error.name === 'TokenExpiredError') return this.refreshJWT(jwt);

			throw new RestError({
				message: 'Authorization failed, please log in to authorize.',
				method: 'POST',
				url: this.$environment.JWTIssuer + '/account/authenticate',
				body: { username: '', password: '' }
			}, 401);
		}
	}

    /**
     * @public @method generateJWT
	 * @description Creates a JWT from a user object
     * @param {Object} user The user object to use for the JWT
     * @return {String} JWT token
     */
	generateJWT(user, userAgent) {
		return JWT.sign({
			iss: this.$environment.JWTIssuer,
			aud: this.$client.origin,
			iat: Math.floor(Date.now() / 1000),
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + parseInt(this.$environment.JWTExpireSeconds),
			uuid: user.uuid,
			userAgent: userAgent
		}, process.env.JWTKey, { algorithm: 'HS256' });
	}

    /**
     * @public @method verifyJWT
	 * @description Verify JWT is valid
     * @param {String} token The token to verify
     * @return {Boolean} Is JWT verified or not?
     */
	verifyJWT(token) {
		return JWT.verify(token, process.env.JWTKey, { algorithm: 'HS256' });
	}

    /**
     * @public @method refreshJWT
	 * @description Verify JWT is valid
     * @param {String} token The token to verify
     * @return {Boolean} Is JWT verified or not?
     */
	refreshJWT(token) {
		let decoded = JWT.decode(token, { complete: true });
		decoded.payload.exp = Math.floor(Date.now() / 1000) + parseInt(this.$environment.JWTExpireSeconds);
		return JWT.sign(decoded.payload, process.env.JWTKey, { algorithm: 'HS256' });
	}




}

module.exports = Auth;
