'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class User
 * @extends Model
 * @description Model class for identity.user table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class User extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor () {
		super('identity.user');
	}

    /**
	 * @public @get @method columns
	 * @description return columns for this model that we give access to
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			active: { type: 'boolean', required: false, description: 'User is active' },
			name: { type: 'string', required: true, description: 'Full user name' }
		};
	}
	
	/**
	 * @public @method getFromUUID
	 * @description Get a single resource in a single table by table id
     * @param {String} uuid The resource uuid to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	getFromUUID(uuid) { return this.model.where({ uuid: uuid }).limit(1).then((data) => data[0] || {}).catch(() => { return {} }) }

	/**
	 * @public @method getWithMetaFromUUID
	 * @description Get a single resource with accompanying meta table data
     * @param {String} uuid The resource uuid to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	getDetailsFromUUID(uuid) { 
		return this.db
			.select(
				'user.*', 
				'user_identity.identity AS identity_identity',
				'user_identity.type AS identity_type',
				'user_identity.primary AS identity_primary'
			)
			.from('identity.user')
			.join('identity.user_account', 'user.id', 'user_account.user_id')
			.join('identity.user_identity', 'user.id', 'user_identity.user_id')
			.where({ 'user.uuid': uuid })
			.then((data) => {
				if (data.length < 1) return {};
				
				let inflate = {identities: []};
				for (let i = 0; i < data.length; i++) {
					inflate.name = data[i].name;
					inflate.active = data[i].active;
					inflate.identities.push({
						identity: data[i].identity_identity,
						type: data[i].identity_type,
						primary: data[i].identity_primary
					});
				}
				return inflate;
			})
			.catch((error) => { console.log(error); return {} }) ;
	}

    /**
     * @public @method getAuthedFromUUID
     * @description Get user data from UUID of user, pushed direct to UI
     * @param {String} uuid The GUID to search for
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
	 * 
	 * SELECT
	 * 	"identity".user.uuid,
	 * 	"identity".user_account.login_current,
	 * 	"identity".user_account.login_previous
	 * FROM "identity".user
	 * JOIN "identity".user_identity ON "identity".user.id = "identity".user_identity.user_id
	 * JOIN "identity".user_account ON "identity".user.id = "identity".user_account.user_id
	 * WHERE "identity".user.uuid = '...'
	 * LIMIT 1;
     */
	getAuthedFromUUID(uuid) {
		return this.db
			.select(
				'user.id',
				'user.uuid',
				'user.name',
				'user.active',
				'user_account.user_agent',
				'user_account.login_current',
				'user_account.login_previous'
			)
			.from('identity.user')
			.join('identity.user_identity', 'user.id', 'user_identity.user_id')
			.join('identity.user_account', 'user.id', 'user_account.user_id')
			.where('user.uuid', uuid)
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getAuthedFromIdentity
     * @description Get authed user for logging in
     * @param {String} username The username to search for
     * @param {String} password The password to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 * 	"identity".user.id,
	 * 	"identity".user.uuid,
	 * 	"identity".user.name,
	 * 	"identity".user.active,
	 * 	"identity".user_account.password,
	 * 	"identity".user_account.login_current,
	 * 	"identity".user_account.login_previous
	 * FROM "identity".user
	 * JOIN "identity".user_identity ON "identity".user.id = "identity".user_identity.user_id
	 * JOIN "identity".user_account ON "identity".user.id = "identity".user_account.user_id
	 * WHERE "identity".user_identity.identity = '...@...'
	 * AND "identity".user_identity.type = '...'
	 * LIMIT 1;
     */
	getAuthedFromIdentity(identity, type) {
		return this.db
			.select(
				'user.id',
				'user.uuid',
				'user.name',
				'user.active',
				'user_account.password',
				'user_account.login_current',
				'user_account.login_previous'
			)
			.from('identity.user')
			.join('identity.user_identity', 'user.id', 'user_identity.user_id')
			.join('identity.user_account', 'user.id', 'user_account.user_id')
			.where('user_identity.identity', identity)
			.andWhere('user_identity.type', type)
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getUserOrganisations
     * @description Get authed user for logging in
     * @param {Number} userID The user id to fetch orgs for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT DISTINCT
	 *	"organisation"."id",
	 *	"organisation"."uuid",
	 *	"organisation"."name",
	 *	"organisation"."name_unique",
	 *	"organisation"."description"
	 * FROM "identity"."user_department"
	 * JOIN "identity"."organisation" ON "organisation"."id" = "user_department"."department_organisation_id"
	 * WHERE "user_department"."user_id" = 1
     */
	getUserOrganisations(userID) {
		return this.db
			.select(
				'organisation.id',
				'organisation.uuid',
				'organisation.name',
				'organisation.name_unique',
				'organisation.active',
				'organisation.description'
			)
			.from('identity.user_department')
			.join('identity.organisation', 'organisation.id', 'user_department.department_organisation_id')
			.where('user_department.user_id', userID)
			.orderBy('organisation.name', 'ASC');
	}

    /**
     * @public @method getUserOrganisation
     * @description Get authed user for logging in
     * @param {Number} userID The user id to fetch org for
     * @param {Number} organisationUUID The organisation uuid to fetch org for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT DISTINCT
	 *	"organisation"."id",
	 *	"organisation"."uuid",
	 *	"organisation"."name",
	 *	"organisation"."name_unique",
	 *	"organisation"."description"
	 * FROM "identity"."user_department"
	 * JOIN "identity"."organisation" ON "organisation"."id" = "user_department"."department_organisation_id"
	 * WHERE "user_department"."user_id" = 1
     */
	getUserOrganisation(userID, organisationUUID) {
		if (!organisationUUID) return Promise.resolve([]);

		return this.db
			.select(
				'organisation.id',
				'organisation.uuid',
				'organisation.name',
				'organisation.name_unique',
				'organisation.active',
				'organisation.description'
			)
			.from('identity.user_department')
			.join('identity.organisation', 'organisation.id', 'user_department.department_organisation_id')
			.where('user_department.user_id', userID)
			.where('organisation.uuid', organisationUUID)
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getAllPermisions
     * @description Get permissions for a user, along with role name
     * @param {Number} userID The id of the user to search for
     * @param {Number} organisationID The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name_unique" AS "role"
	 *	, COALESCE(bool_or("user_role"."read") OR bool_or("department_role"."read") OR bool_or("user_group_role"."read") OR bool_or("department_group_role"."read"), FALSE) AS "read"
	 *	, COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"
	 *	, COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"
	 * FROM "identity".role
	 * LEFT JOIN "identity".user_department ON user_department.user_id = ? AND user_department.department_organisation_id = ?
	 * -- get specific user roles
	 * LEFT JOIN "identity".user_role ON user_role.role_id = role.id AND user_role.user_id = user_department.user_id
	 * -- get specific department roles
	 * LEFT JOIN "identity".department_role ON "identity".department_role.role_id = "identity".role.id AND "identity".department_role.department_id = "identity".user_department.department_id
	 * -- get specific user group roles
	 * LEFT JOIN "identity".user_group ON "identity".user_group.user_id = "identity".user_department.user_id
	 * LEFT JOIN "identity".group_role AS user_group_role ON user_group_role.group_id = "identity".user_group.group_id AND user_group_role.role_id = role.id
	 * -- get specific department group roles
	 * LEFT JOIN "identity".department_group ON "identity".department_group.department_id = "identity".user_department.department_id
	 * LEFT JOIN "identity".group_role AS department_group_role ON department_group_role.group_id = "identity".department_group.group_id AND department_group_role.role_id = role.id
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY "identity".role.name_unique
	 * ORDER BY "identity".role.name_unique ASC;
     */
	getAllPermisions(userID, organisationID) {
		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', userID).andOn('user_department.department_organisation_id', '=', organisationID || 0) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.groupBy('role.name_unique')
			.orderBy('role.name_unique', 'ASC');
	}

    /**
     * @public @method getAllPermisions
     * @description Get permissions starting with match, for a user, along with role name
     * @param {String} match The partial match for the role name
     * @param {Number} userID The id of the user to search for
     * @param {Number} organisationID The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name_unique" AS "role"
	 *	, COALESCE(bool_or("user_role"."read") OR bool_or("department_role"."read") OR bool_or("user_group_role"."read") OR bool_or("department_group_role"."read"), FALSE) AS "read"
	 *	, COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"
	 *	, COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"
	 * FROM "identity".role
	 * LEFT JOIN "identity".user_department ON user_department.user_id = ? AND user_department.department_organisation_id = ?
	 * -- get specific user roles
	 * LEFT JOIN "identity".user_role ON user_role.role_id = role.id AND user_role.user_id = user_department.user_id
	 * -- get specific department roles
	 * LEFT JOIN "identity".department_role ON "identity".department_role.role_id = "identity".role.id AND "identity".department_role.department_id = "identity".user_department.department_id
	 * -- get specific user group roles
	 * LEFT JOIN "identity".user_group ON "identity".user_group.user_id = "identity".user_department.user_id
	 * LEFT JOIN "identity".group_role AS user_group_role ON user_group_role.group_id = "identity".user_group.group_id AND user_group_role.role_id = role.id
	 * -- get specific department group roles
	 * LEFT JOIN "identity".department_group ON "identity".department_group.department_id = "identity".user_department.department_id
	 * LEFT JOIN "identity".group_role AS department_group_role ON department_group_role.group_id = "identity".department_group.group_id AND department_group_role.role_id = role.id
	 * -- reduce to specific role
	 * WHERE "role"."name_unique" LIKE '...%'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY "identity".role.name_unique
	 * ORDER BY "identity".role.name_unique ASC;
     */
	getPermisions(match, userID, organisationID) {
		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', userID).andOn('user_department.department_organisation_id', '=', organisationID || 0) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.where('role.name_unique', 'LIKE', match + '%')
			.groupBy('role.name_unique')
			.orderBy('role.name_unique', 'ASC');
	}

    /**
     * @public @method getPermision
     * @description Get a permission for a user, along with role name
     * @param {String} match The full match for the role name
     * @param {Number} userID The id of the user to search for
     * @param {Number} organisationID The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name_unique" AS "role"
	 *	, COALESCE(bool_or("user_role"."read") OR bool_or("department_role"."read") OR bool_or("user_group_role"."read") OR bool_or("department_group_role"."read"), FALSE) AS "read"
	 *	, COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"
	 *	, COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"
	 * FROM "identity".role
	 * LEFT JOIN "identity".user_department ON user_department.user_id = ? AND user_department.department_organisation_id = ?
	 * -- get specific user roles
	 * LEFT JOIN "identity".user_role ON user_role.role_id = role.id AND user_role.user_id = user_department.user_id
	 * -- get specific department roles
	 * LEFT JOIN "identity".department_role ON "identity".department_role.role_id = "identity".role.id AND "identity".department_role.department_id = "identity".user_department.department_id
	 * -- get specific user group roles
	 * LEFT JOIN "identity".user_group ON "identity".user_group.user_id = "identity".user_department.user_id
	 * LEFT JOIN "identity".group_role AS user_group_role ON user_group_role.group_id = "identity".user_group.group_id AND user_group_role.role_id = role.id
	 * -- get specific department group roles
	 * LEFT JOIN "identity".department_group ON "identity".department_group.department_id = "identity".user_department.department_id
	 * LEFT JOIN "identity".group_role AS department_group_role ON department_group_role.group_id = "identity".department_group.group_id AND department_group_role.role_id = role.id
	 * -- reduce to specific role
	 * WHERE "role"."name_unique" = '...'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY "identity".role.name_unique
	 * LIMIT 1;
     */
	getPermision(match, userID, organisationID) {
		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', userID).andOn('user_department.department_organisation_id', '=', organisationID || 0) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.where('role.name_unique', match)
			.groupBy('role.name_unique')
			.limit(1);
	}
}

module.exports = User;