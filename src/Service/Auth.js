'use strict';

const Service = require('../System/Service.js');
const RestError = require('../System/RestError.js');
const Crypto = require('../Library/Crypto.js');
const UserModel = require('../Model/User/User.js');
const UserAccountModel = require('../Model/User/UserAccount.js');
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
	login(username, password, ip) {
		let userModel = new UserModel();
		let userAccountModel = new UserAccountModel();

		return userModel.getFromCredentials(username).then((user) => {
			// NOTE: need to flood prevent here too
			if (!user) throw new RestError('Login details incorrect, please try again...', 401);
            if (user.password !== Crypto.passwordHash(password, user.password.substring(0, user.password.length / 2))) throw new RestError('Login details incorrect, please try again...', 401);
			
			return user;
		}).then((user) => {
			let date = new Date();

			// update user but return data from before update so last logged on correct
			return userAccountModel
				.update(user.id, { login_current: date , login_previous: user.login_current })
				.then((update) => ({
					uuid: user.uuid, 
					email: user.email, 
					login_current: date, 
					login_previous: user.login_current
				}));
		}).then((user) => {
			// construct output and inject header
			return { authorization: this.generateJWT(user), user: user };
		});
	}

    /**
     * @public @method verify
	 * @description Verify a user is still logged in. Has JWT expired?
     * @param {String} authorization The auth string from the request header, to verify
     * @return {Object} The user object to return if verified
     */
	verify(authorization) {
		let payload;
		let jwt = authorization.replace('Bearer', '').trim();
		if (!jwt) throw new RestError('Login details incorrect, please try again...', 401);

		try {
			payload = this.verifyJWT(jwt);
		} catch(error) {
			throw new RestError('Invalid JWT', 401);
		}

// { iss: 'https://cvapi.razilo.net',
//   aud: 'https://cv.razilo.net',
//   iat: 1561063121,
//   nbf: 1561063121,
//   exp: 1561063721,
//   guid: 11 }

		let userModel = new UserModel();

		return userModel.getFromUUID(payload.guid).then((data) => {
			// NOTE: need to flood prevent here too
			if (!data || !data.id) throw new RestError('User not found, please try again...', 401);

			console.log(data);
			// return {name: data.name, email: data.email, last_logged_in: };
			return {};
		})

		console.log('[DONE] Check valid jwt data');
		console.log('get the user');
		console.log('verify a pin or some other data is correct to lock it down');
		console.log('save the user to this.user');
		console.log('return, so this can be used to ping and also to set th euser in the service for hwen we do more');
		


		return Promise.resolve({ 'key': 'ping' });
	}

    /**
     * @public @method generateJWT
	 * @description Creates a JWT from a user object
     * @param {Object} user The user object to use for the JWT
     * @return {String} JWT token
     */
	generateJWT(user) {
		return JWT.sign({
			iss: 'http://127.0.0.1:3000',
			aud: this.$client.origin,
			iat: Math.floor(Date.now() / 1000),
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + parseInt(this.$environment.JWTExpireSeconds),
			uuid: user.uuid
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
}

module.exports = Auth;
