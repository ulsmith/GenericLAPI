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
		this.organisation;
		this.permissions;
		this.cache;
	}

    /**
     * @public @method login
	 * @description Log a user in based on identity and password
     * @param {String} identity The resource to fetch with the given key
     * @param {String} password The resource to fetch with the given key
     * @param {String} ip The resource to fetch with the given key
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	login(identity, identityType, password, organisationUUID, userAgent, ip) {
		if (!identity || !password) throw new RestError('Login details incorrect, please try again.', 401);
		if (!!identityType && ['email', 'phone'].indexOf(identityType) < 0) throw new RestError('Login details incorrect, please try again.', 401);

		let userModel = new UserModel();
		let userAccountModel = new UserAccountModel();

		return userModel.getAuthedFromIdentity(identity, identityType)
			.then((user) => {
				// NOTE: need to flood prevent here too
				if (!user) throw new RestError('Login details incorrect, please try again.', 401);
				if (user.password !== Crypto.passwordHash(password, user.password.substring(0, user.password.length / 2))) throw new RestError('Login details incorrect, please try again.', 401);
				if (!user.active) throw new RestError('User is not active, please try again later.', 401);
				
				return user;
			})
			.then((user) => userModel.getUserOrganisations(user.id).then((orgs) => ({user: user, orgs: orgs})))		
			.then((userOrgs) => {
				let org = userOrgs.orgs[0];

				// we have more than one org, so user must remake request with org uuid, give them choice
				if (userOrgs.orgs.length > 1) {
					let orgs = userOrgs.orgs.filter((data) => data.uuid === organisationUUID);

					if (org.length !== 1) {
						throw new RestError({
							'message': 'User is part of many organisations, please add [organisationUUID] to request.',
							'organisations': userOrgs.orgs
						}, 403);
					}

					org = orgs[0];
				}

				// if we do have an org chosen, check active too
				if (!!org && !org.active) throw new RestError('Organisation is not active, please try again later.', 401);

				// update user, get permissions for UI and return token, only one org so must be that one
				let date = new Date();
				return userAccountModel
					.update(userOrgs.user.id, { login_current: date, login_previous: userOrgs.user.login_current, user_agent: userAgent, ip_address: ip })
					.then(() => userModel.getPermisions('ui.', userOrgs.user.id, org ? org.id : undefined))
					.then((perms) => {
						// splice in identity
						userOrgs.user.identity = identity;
						userOrgs.user.identityType = identityType;

						let result = { 
							token: this._generateJWT(userOrgs.user, org, userAgent),
							user: {
								uuid: userOrgs.user.uuid,
								name: userOrgs.user.name,
								identity: identity,
								identityType: identityType,
								loginCurrent: date,
								loginPrevious: userOrgs.user.login_current
							},
							permissions: perms
						};
						
						if (org) {
							result.organisation = {
								uuid: org.uuid,
								name: org.name,
								nameUnique: org.name_unique,
								description: org.description
							};
						}

						return result;
					});
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
			payload = this._verifyJWT(jwt);
		} catch(error) {
			if (error.name === 'TokenExpiredError') {
				throw new RestError({ 
					status: 'expired',
					message: 'Authorization expired, please refresh expired token.', 
					method: 'POST', 
					url: 'account/refresh',
					body: {token: jwt}
				}, 401);
			}
			
			throw new RestError({
				status: 'expired',
				message: 'Authorization failed, please log in to authorize.',
				method: 'POST',
				url: 'account/authenticate',
				body: { identity: '', password: '' }
			}, 401);
		}

		// have we switched origins?
		if (payload.aud !== this.$client.origin) throw new RestError('Origin / Token missmatch, invalid', 401);
		if (payload.userAgent !== userAgent) throw new RestError('Client browser has changed, invalid', 401);

		let userModel = new UserModel();

		return userModel.getAuthedFromUUID(payload.userUUID)
			.then((user) => userModel.getUserOrganisation(user.id, payload.organisationUUID).then((org) => ({ user: user, org: org })))
			.then((userOrg) => userModel.getAllPermisions(userOrg.user.id, userOrg.org.id).then((perms) => ({ user: userOrg.user, org: userOrg.org, perms: perms})))
			.then((userOrgPerms) => {
				if (!userOrgPerms.user) throw new RestError('User not found, please try again.', 404);
				if (!userOrgPerms.org) throw new RestError('Organisation not found, please try again later.', 404);
				if (!userOrgPerms.user.active) throw new RestError('User is not active, please try again later.', 401);
				
				// cache user for system use
				this.user = userOrgPerms.user;
				this.user.identity = payload.userIdentity,
				this.user.identityType = payload.userIdentityType,
				this.organisation = userOrgPerms.org;
				this.permissions = userOrgPerms.perms;
				this.cache = {};
				
				// return basic user details when hit directly
				return { 
					user: {
						uuid: this.user.uuid,
						name: this.user.name,
						identity: payload.userIdentity,
						identityType: payload.userIdentityType,
						loginCurrent: this.user.login_current,
						loginPrevious: this.user.login_previous
					},
					organisation: {
						uuid: this.organisation.uuid,
						name: this.organisation.name,
						nameUnique: this.organisation.name_unique,
						description: this.organisation.description
					},
					permissions: this.permissions.filter((perm) => perm.role.indexOf('ui.') === 0)
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
			if (this._verifyJWT(jwt)) return this._refreshJWT(jwt);
		} catch (error) {
			// if expired, refresh
			if (error.name === 'TokenExpiredError') return this._refreshJWT(jwt);

			throw new RestError({
				message: 'Authorization failed, please log in to authorize.',
				method: 'POST',
				url: this.$environment.HostAddress + '/account/authenticate',
				body: { identity: '', password: '' }
			}, 401);
		}
	}

    /**
     * @public @method isPermitted
	 * @description Handle a permission denied situation
     * @param {String} role The specific role to check as 'api.aaa.bbb' or any of a combination of roles allowed 'api.aaa/aaaa.bbb/bbbb'
     * @param {String} type The access type to check such as 'read' or more than one 'read,write,delete'
     */
	isPermitted(role, type) {
		// convert to regex, get roles and split types
		let regex = '^' + role.split('.').map((r) => r.indexOf('/') > 0 ? '(' + r.replace(/\//g, '|') + ')' : r).join('\\.') + '$';
		let roles = this.filterPermissions(new RegExp(regex));
		let types = type.split(',');

		// no roles found
		if (roles.length === 0) this.permissionDenied(role, type);
		
		// one role found
		if (roles.length === 1) {
			if (
				(types.length === 1 && !roles[0][types[0].trim()])
				|| (types.length === 2 && (!roles[0][types[0].trim()] || !roles[0][types[1].trim()]))
				|| (types.length === 3 && (!roles[0][types[0].trim()] || !roles[0][types[1].trim()] || !roles[0][types[2].trim()]))
			) this.permissionDenied(role, types[0]);
		}

		// more than one role found
		if (roles.length > 1) {
			let reduced = roles.reduce((acc, cur) => ({read: acc.read || cur.read, write: acc.write || cur.write, delete: acc.delete || cur.delete}));
			if (
				(types.length === 1 && !reduced[types[0].trim()])
				|| (types.length === 2 && (!reduced[types[0].trim()] || !reduced[types[1].trim()]))
				|| (types.length === 3 && (!reduced[types[0].trim()] || !reduced[types[1].trim()] || !reduced[types[2].trim()]))
			) this.permissionDenied(role, types[0]);
		}
	}

    /**
     * @public @method permissionDenied
	 * @description Handle a permission denied situation
     * @param {String} role The role to check
     * @param {String} type The access type to check
     */
	permissionDenied(role, type) {
		console.log(`[UserUUID: ${this.user.uuid}, OrgUUID: ${this.organisation.uuid}] No '${type}' access to '${role}' role`);
		throw new RestError(`Permission denied, you do not have '${type}' access to this resource`, 403);
	}

    /**
     * @public @method getPermission
	 * @description Fetch permission to check
     * @param {String} role The role to check
     * @return {Object} Do you have permission, permission object
     */
	getPermission(role) { return this.$services.auth.permissions.find((perm) => perm.role === role) || {} }

    /**
     * @public @method getPermissions
	 * @description Fetch permissions to check
     * @param {String} prefix The partial role prefix to match from the beginning of a role
     * @return {Array} Do you have permissions, array of permission objects
     */
	getPermissions(prefix) { return this.$services.auth.permissions.filter((perm) => perm.role.indexOf(prefix) === 0) || [] }

    /**
     * @public @method filterPermissions
	 * @description Fetch permissions to check
     * @param {Regex} regex The regex to filter on
     * @return {Array} Do you have permissions, array of permission objects
     */
	filterPermissions(regex) { return this.$services.auth.permissions.filter((perm) => regex.test(perm.role)) || [] }

    /**
     * @private @method _generateJWT
	 * @description Creates a JWT from a user object
     * @param {Object} user The user object to use for the JWT
     * @return {String} JWT token
     */
	_generateJWT(user, organisation, userAgent) {
		return JWT.sign({
			iss: this.$environment.HostAddress,
			aud: this.$client.origin,
			iat: Math.floor(Date.now() / 1000),
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + parseInt(this.$environment.JWTExpireSeconds),
			userUUID: user.uuid,
			userIdentity: user.identity,
			userIdentityType: user.identityType,
			organisationUUID: organisation ? organisation.uuid : undefined,
			userAgent: userAgent
		}, process.env.JWTKey, { algorithm: 'HS256' });
	}

    /**
     * @private @method _verifyJWT
	 * @description Verify JWT is valid
     * @param {String} token The token to verify
     * @return {Boolean} Is JWT verified or not?
     */
	_verifyJWT(token) {
		return JWT.verify(token, process.env.JWTKey, { algorithm: 'HS256' });
	}

    /**
     * @private @method _refreshJWT
	 * @description Verify JWT is valid
     * @param {String} token The token to verify
     * @return {Boolean} Is JWT verified or not?
     */
	_refreshJWT(token) {
		let decoded = JWT.decode(token, { complete: true });
		decoded.payload.exp = Math.floor(Date.now() / 1000) + parseInt(this.$environment.JWTExpireSeconds);
		return JWT.sign(decoded.payload, process.env.JWTKey, { algorithm: 'HS256' });
	}
}

module.exports = Auth;
