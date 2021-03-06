'use strict';

const Model = require('../../../System/Model.js');
const UserIdentityModel = require('../Identity/UserIdentity.js');
const UserAccountModel = require('../Identity/UserAccount.js');
const UserGroupModel = require('../Identity/UserGroup.js');
const SystemError = require('../../../System/SystemError.js');
const Crypto = require('../../../Library/Crypto.js');

/**
 * @namespace API/Model/DatabaseName/Identity
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
	constructor() {
		super('database', 'identity.user');
	}

    /**
	 * @public @get @method columns
	 * @description Columns that we allow to be changed through requests to API
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			active: { type: 'boolean', required: false, description: 'User is active' },
			name: { type: 'string', required: true, description: 'Full user name' }
		};
	}

	/**
	 * @public @method getDetails
	 * @description Get details for all users
     * @return {Promise} a resulting promise of data or error on failure
     */
	getAllDetails() {
		return this.db
			.select(
				'user.*',
				'user_identity.id AS user_identity_id',
				'user_identity.identity AS user_identity_identity',
				'user_identity.type AS user_identity_type',
				'user_identity.primary AS user_identity_primary',
				'organisation.id AS organisation_id',
				'organisation.name AS organisation_name'
			)
			.from('identity.user')
			.leftJoin('identity.user_account', 'user.id', 'user_account.user_id')
			.leftJoin('identity.user_identity', 'user.id', 'user_identity.user_id')
			.leftJoin('identity.user__department', 'user.id', 'user__department.user_id')
			.leftJoin('identity.organisation', 'user__department.department_organisation_id', 'organisation.id')
			.then((rows) => {
				if (rows.length < 1) [];

				let users = {};
				let ui_ids = [];
				let org_ids = [];
				for (let row of rows) {
					if (!users[row.id]) users[row.id] = { id: row.id, name: row.name, active: row.active, user_identity: [], organisation: [] };

					if (row.user_identity_id && ui_ids.indexOf(row.user_identity_id) < 0) {
						users[row.id].user_identity.push({ id: row.user_identity_id, identity: row.user_identity_identity, type: row.user_identity_type, primary: row.user_identity_primary });
						ui_ids.push(row.user_identity_id);
					}

					if (row.organisation_id && org_ids.indexOf(row.organisation_id) < 0) {
						users[row.id].organisation.push({ id: row.organisation_id, name: row.organisation_name });
						ui_ids.push(row.organisation_id);
					}
				}

				return Object.values(users);
			});
	}

	/**
	 * @public @method getDetails
	 * @description Get a single resource with accompanying meta table data
     * @param {String} id The resource id to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	getDetails(id) {
		return this.db
			.select(
				'user.*',
				'user_identity.id AS user_identity_id',
				'user_identity.identity AS user_identity_identity',
				'user_identity.type AS user_identity_type',
				'user_identity.primary AS user_identity_primary',
				'organisation.id AS organisation_id',
				'organisation.name AS organisation_name'
			)
			.from('identity.user')
			.leftJoin('identity.user_account', 'user.id', 'user_account.user_id')
			.leftJoin('identity.user_identity', 'user.id', 'user_identity.user_id')
			.leftJoin('identity.user__department', 'user.id', 'user__department.user_id')
			.leftJoin('identity.organisation', 'user__department.department_organisation_id', 'organisation.id')
			.where({ 'user.id': id })
			.then((rows) => {
				if (rows.length < 1) { };

				let users = {};
				let ui_ids = [];
				let org_ids = [];
				for (let row of rows) {
					if (!users[row.id]) users[row.id] = { id: row.id, name: row.name, active: row.active, user_identity: [], organisation: [] };

					if (row.user_identity_id && ui_ids.indexOf(row.user_identity_id) < 0) {
						users[row.id].user_identity.push({ id: row.user_identity_id, identity: row.user_identity_identity, type: row.user_identity_type, primary: row.user_identity_primary });
						ui_ids.push(row.user_identity_id);
					}

					if (row.organisation_id && org_ids.indexOf(row.organisation_id) < 0) {
						users[row.id].organisation.push({ id: row.organisation_id, name: row.organisation_name });
						ui_ids.push(row.organisation_id);
					}
				}

				return Object.values(users)[0] || {};
			});
	}

    /**
     * @public @method getAuthed
     * @description Get user data from id of user, pushed direct to UI
     * @param {String} id The GUID to search for
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
	 * 
	 * SELECT
	 * 	"identity".user.id,
	 * 	"identity".user_account.login_current,
	 * 	"identity".user_account.login_previous
	 * FROM "identity".user
	 * JOIN "identity".user_identity ON "identity".user.id = "identity".user_identity.user_id
	 * JOIN "identity".user_account ON "identity".user.id = "identity".user_account.user_id
	 * WHERE "identity".user.id = '...'
	 * LIMIT 1;
     */
	getAuthed(id) {
		return this.db
			.select(
				'user.id',
				'user.name',
				'user.active',
				'user_account.id AS user_account_id',
				'user_account.user_agent',
				'user_account.login_current',
				'user_account.login_previous'
			)
			.from('identity.user')
			.join('identity.user_identity', 'user.id', 'user_identity.user_id')
			.join('identity.user_account', 'user.id', 'user_account.user_id')
			.where('user.id', id)
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
				'user.name',
				'user.active',
				'user_account.id AS user_account_id',
				'user_account.password',
				'user_account.login_current',
				'user_account.login_previous',
				'user_account.ip_address',
				'user_account.user_agent',
				'user_account.password_reminder',
				'user_account.password_reminder_sent',
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
	 *	"organisation"."name",
	 *	"organisation"."name_unique",
	 *	"organisation"."description"
	 * FROM "identity"."user__department"
	 * JOIN "identity"."organisation" ON "organisation"."id" = "user__department"."department_organisation_id"
	 * WHERE "user__department"."user_id" = 1
     */
	getUserOrganisations(userID) {
		return this.db
			.select(
				'organisation.id',
				'organisation.name',
				'organisation.name_unique',
				'organisation.active',
				'organisation.description'
			)
			.from('identity.user__department')
			.join('identity.organisation', 'organisation.id', 'user__department.department_organisation_id')
			.where('user__department.user_id', userID)
			.orderBy('organisation.name', 'ASC');
	}

    /**
     * @public @method getUserOrganisation
     * @description Get authed user for logging in
     * @param {Number} userID The user id to fetch org for
     * @param {Number} organisationID The organisation id to fetch org for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT DISTINCT
	 *	"organisation"."id",
	 *	"organisation"."name",
	 *	"organisation"."name_unique",
	 *	"organisation"."description"
	 * FROM "identity"."user__department"
	 * JOIN "identity"."organisation" ON "organisation"."id" = "user__department"."department_organisation_id"
	 * WHERE "user__department"."user_id" = 1
     */
	getUserOrganisation(userID, organisationID) {
		if (!organisationID) return Promise.resolve([]);

		return this.db
			.select(
				'organisation.id',
				'organisation.name',
				'organisation.name_unique',
				'organisation.active',
				'organisation.description'
			)
			.from('identity.user__department')
			.join('identity.organisation', 'organisation.id', 'user__department.department_organisation_id')
			.where('user__department.user_id', userID)
			.where('organisation.id', organisationID)
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
	 * "role"."name_unique" AS "role"
	 * , COALESCE(bool_or("user__role"."read") OR bool_or("department__role"."read") OR bool_or("user__group__role"."read") OR bool_or("department__group__role"."read"), FALSE) AS "read"
	 * , COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"
	 * , COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"
	 * FROM "identity"."role"
	 * -- get user and department first
	 * LEFT JOIN "identity"."user" ON "user"."id" = 1
	 * LEFT JOIN "identity"."user__department" ON "user__department"."user_id" = 1 AND "user__department"."department_organisation_id" = 0
	 * -- get specific user roles (from user)
	 * LEFT JOIN "identity"."user__role" ON "user__role"."role_id" = "role"."id" AND "user__role"."user_id" = "user"."id"
	 * -- get specific department roles (from department)
	 * LEFT JOIN "identity"."department__role" ON "department__role"."role_id" = "role"."id" AND "department__role"."department_id" = "user__department"."department_id"
	 * -- get specific user group roles (from user)
	 * LEFT JOIN "identity"."user__group" ON "user__group"."user_id" = "user"."id"
	 * LEFT JOIN "identity"."group__role" AS "user__group__role" ON "user__group__role"."group_id" = "user__group"."group_id" AND "user__group__role"."role_id" = "role"."id"
	 * -- get specific department group roles (from department)
	 * LEFT JOIN "identity"."department__group" ON "department__group"."department_id" = "user__department"."department_id"
	 * LEFT JOIN "identity"."group__role" AS "department__group__role" ON "department__group__role"."group_id" = "department__group"."group_id" AND "department__group__role"."role_id" = "role"."id"
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY role.name_unique
	 * ORDER BY "role"."name_unique" ASC;
     */
	getAllPermisions(userID, organisationID) {
		// convert UUID to raw due to using them on joins
		let rUserID = this.db.raw('?', userID);
		let rOrgID = this.db.raw('?', organisationID || null);

		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user__role.read) OR bool_or(department__role.read) OR bool_or(user__group__role.read) OR bool_or(department__group__role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user', 'user.id', rUserID)
			.leftJoin('identity.user__department', function () { this.on('user__department.user_id', '=', rUserID).andOn('user__department.department_organisation_id', '=', rOrgID) })
			.leftJoin('identity.user__role', function () { this.on('user__role.role_id', '=', 'role.id').andOn('user__role.user_id', '=', 'user.id') })
			.leftJoin('identity.department__role', function () { this.on('department__role.role_id', '=', 'role.id').andOn('department__role.department_id', '=', 'user__department.department_id') })
			.leftJoin('identity.user__group', 'user__group.user_id', 'user.id')
			.leftJoin('identity.group__role AS user__group__role', function () { this.on('user__group__role.group_id', '=', 'user__group.group_id').andOn('user__group__role.role_id', '=', 'role.id') })
			.leftJoin('identity.department__group', 'department__group.department_id', 'user__department.department_id')
			.leftJoin('identity.group__role AS department__group__role', function () { this.on('department__group__role.group_id', '=', 'department__group.group_id').andOn('department__group__role.role_id', '=', 'role.id') })
			.groupBy('role.name_unique')
			.orderBy('role.name_unique', 'ASC');
	}

    /**
     * @public @method getPermisions
     * @description Get permissions starting with match, for a user, along with role name
     * @param {String} match The partial match for the role name
     * @param {Number} userID The id of the user to search for
     * @param {Number} organisationID The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 * "role"."name_unique" AS "role"
	 * , COALESCE(bool_or("user__role"."read") OR bool_or("department__role"."read") OR bool_or("user__group__role"."read") OR bool_or("department__group__role"."read"), FALSE) AS "read"
	 * , COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"
	 * , COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"
	 * FROM "identity"."role"
	 * -- get user and department first
	 * LEFT JOIN "identity"."user" ON "user"."id" = 1
	 * LEFT JOIN "identity"."user__department" ON "user__department"."user_id" = 1 AND "user__department"."department_organisation_id" = 0
	 * -- get specific user roles (from user)
	 * LEFT JOIN "identity"."user__role" ON "user__role"."role_id" = "role"."id" AND "user__role"."user_id" = "user"."id"
	 * -- get specific department roles (from department)
	 * LEFT JOIN "identity"."department__role" ON "department__role"."role_id" = "role"."id" AND "department__role"."department_id" = "user__department"."department_id"
	 * -- get specific user group roles (from user)
	 * LEFT JOIN "identity"."user__group" ON "user__group"."user_id" = "user"."id"
	 * LEFT JOIN "identity"."group__role" AS "user__group__role" ON "user__group__role"."group_id" = "user__group"."group_id" AND "user__group__role"."role_id" = "role"."id"
	 * -- get specific department group roles (from department)
	 * LEFT JOIN "identity"."department__group" ON "department__group"."department_id" = "user__department"."department_id"
	 * LEFT JOIN "identity"."group__role" AS "department__group__role" ON "department__group__role"."group_id" = "department__group"."group_id" AND "department__group__role"."role_id" = "role"."id"
	 * --reduce to specific role
	 * WHERE "role"."name_unique" LIKE '...%'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY role.name_unique
	 * ORDER BY "role"."name_unique" ASC;
     */
	getPermisions(match, userID, organisationID) {
		// convert UUID to raw due to using them on joins
		let rUserID = this.db.raw('?', userID);
		let rOrgID = this.db.raw('?', organisationID || null);

		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user__role.read) OR bool_or(department__role.read) OR bool_or(user__group__role.read) OR bool_or(department__group__role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user', 'user.id', rUserID)
			.leftJoin('identity.user__department', function () { this.on('user__department.user_id', '=', rUserID).andOn('user__department.department_organisation_id', '=', rOrgID) })
			.leftJoin('identity.user__role', function () { this.on('user__role.role_id', '=', 'role.id').andOn('user__role.user_id', '=', 'user.id') })
			.leftJoin('identity.department__role', function () { this.on('department__role.role_id', '=', 'role.id').andOn('department__role.department_id', '=', 'user__department.department_id') })
			.leftJoin('identity.user__group', 'user__group.user_id', 'user.id')
			.leftJoin('identity.group__role AS user__group__role', function () { this.on('user__group__role.group_id', '=', 'user__group.group_id').andOn('user__group__role.role_id', '=', 'role.id') })
			.leftJoin('identity.department__group', 'department__group.department_id', 'user__department.department_id')
			.leftJoin('identity.group__role AS department__group__role', function () { this.on('department__group__role.group_id', '=', 'department__group.group_id').andOn('department__group__role.role_id', '=', 'role.id') })
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
	 * "role"."name_unique" AS "role"
	 * , COALESCE(bool_or("user__role"."read") OR bool_or("department__role"."read") OR bool_or("user__group__role"."read") OR bool_or("department__group__role"."read"), FALSE) AS "read"
	 * , COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"
	 * , COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"
	 * FROM "identity"."role"
	 * -- get user and department first
	 * LEFT JOIN "identity"."user" ON "user"."id" = 1
	 * LEFT JOIN "identity"."user__department" ON "user__department"."user_id" = 1 AND "user__department"."department_organisation_id" = 0
	 * -- get specific user roles (from user)
	 * LEFT JOIN "identity"."user__role" ON "user__role"."role_id" = "role"."id" AND "user__role"."user_id" = "user"."id"
	 * -- get specific department roles (from department)
	 * LEFT JOIN "identity"."department__role" ON "department__role"."role_id" = "role"."id" AND "department__role"."department_id" = "user__department"."department_id"
	 * -- get specific user group roles (from user)
	 * LEFT JOIN "identity"."user__group" ON "user__group"."user_id" = "user"."id"
	 * LEFT JOIN "identity"."group__role" AS "user__group__role" ON "user__group__role"."group_id" = "user__group"."group_id" AND "user__group__role"."role_id" = "role"."id"
	 * -- get specific department group roles (from department)
	 * LEFT JOIN "identity"."department__group" ON "department__group"."department_id" = "user__department"."department_id"
	 * LEFT JOIN "identity"."group__role" AS "department__group__role" ON "department__group__role"."group_id" = "department__group"."group_id" AND "department__group__role"."role_id" = "role"."id"
	 * --reduce to specific role
	 * WHERE "role"."name_unique" LIKE '...%'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY role.name_unique
	 * LIMIT 1;
     */
	getPermision(match, userID, organisationID) {
		// convert UUID to raw due to using them on joins
		let rUserID = this.db.raw('?', userID);
		let rOrgID = this.db.raw('?', organisationID || null);

		return this.db
			.select(
				'role.name_unique AS role',
				this.db.raw('COALESCE(bool_or(user__role.read) OR bool_or(department__role.read) OR bool_or(user__group__role.read) OR bool_or(department__group__role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user__role"."write") OR bool_or("department__role"."write") OR bool_or("user__group__role"."write") OR bool_or("department__group__role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user__role"."delete") OR bool_or("department__role"."delete") OR bool_or("user__group__role"."delete") OR bool_or("department__group__role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user', 'user.id', rUserID)
			.leftJoin('identity.user__department', function () { this.on('user__department.user_id', '=', rUserID).andOn('user__department.department_organisation_id', '=', rOrgID) })
			.leftJoin('identity.user__role', function () { this.on('user__role.role_id', '=', 'role.id').andOn('user__role.user_id', '=', 'user.id') })
			.leftJoin('identity.department__role', function () { this.on('department__role.role_id', '=', 'role.id').andOn('department__role.department_id', '=', 'user__department.department_id') })
			.leftJoin('identity.user__group', 'user__group.user_id', 'user__department.user_id')
			.leftJoin('identity.group__role AS user__group__role', function () { this.on('user__group__role.group_id', '=', 'user__group.group_id').andOn('user__group__role.role_id', '=', 'role.id') })
			.leftJoin('identity.department__group', 'department__group.department_id', 'user.id')
			.leftJoin('identity.group__role AS department__group__role', function () { this.on('department__group__role.group_id', '=', 'department__group.group_id').andOn('department__group__role.role_id', '=', 'role.id') })
			.where('role.name_unique', match)
			.groupBy('role.name_unique')
			.limit(1);
	}

    /**
     * @public @method add
     * @description Add a user and all meta tables. Must include identity and account data
     * @param {String} data The data to combine into a new user
     * @return Promise a resulting promise with an error to feed back or data to send on
	 * @example add({ name: <string>, identity: [{ identity: <string>, type: <email|phone> }], account: { password: <string> } });
	 */
	add(data) {
		let userIdentity = new UserIdentityModel();
		let userAccount = new UserAccountModel();
		let userGroup = new UserGroupModel();
		let uMapped, uiMapped, uaMapped;

		return Promise.resolve().then(() => {
			// map data, checking integrity
			uMapped = this.mapDataToColumn(data);
			uiMapped = userIdentity.mapDataArrayToColumn(data.userIdentity);
			uaMapped = userAccount.mapDataToColumn(data.userAccount);
		}).catch((error) => {
			// manage error, parse and re-throw
			if (error.name === 'SystemError') throw new SystemError(error.message, { user: { ...this.columns, userIdentity: [userIdentity.columns], userAccount: userAccount.columns } });
			throw error;
		}).then(() => {
			// perform add new user, identities and account data, rollback on failure
			return this.transaction((trx) => {
				return this.transactInsert(trx, uMapped, '*')
					.then((usrs) => {
						// insert to identities if any
						if (uiMapped) {
							uiMapped.map((d) => d.user_id = usrs[0].id);
							return userIdentity.transactInsert(trx, uiMapped, ['id', 'identity', 'type', 'primary'])
								.then((ui) => ({ ...usrs[0], ...{ userIdentity: ui } }))
								.catch((error) => {
									throw new SystemError('Invalid data, could not add record', { ...userIdentity.parseError(error), userIdentity: userIdentity.columns });
								});
						}

						return usrs[0];
					})
					.then((usr) => {
						// add account data
						if (uaMapped) {
							uaMapped.user_id = usr.id;
							return userAccount.transactInsert(trx, uaMapped)
								.then(() => usr)
								.catch((error) => {
									throw new SystemError('Invalid data, could not add record', { ...userAccount.parseError(error), userAccount: userAccount.columns });
								});
						}

						return usr;
					})
					.then((usr) => {
						// add new user to basic user group on default DB setup
						return userGroup.transactInsert(trx, { user_id: usr.id, group_id: this.$environment.USER_BASIC_USER_GROUP_ID })
							.then(() => usr)
							.catch((error) => {
								throw new SystemError('Invalid data, could not add record');
							});
					})
					.then((usr) => ({ id: usr.id, name: usr.name, active: usr.active, userIdentity: usr.userIdentity }))
					.then(trx.commit)
					.catch(trx.rollback);
			})
		});
	}

    /**
     * @public @method edit
     * @description Edit a user and all meta tables. Must include identity and account data
     * @param {String} data The data to combine into a new user
     * @param {Boolean} partial Perform a partial update of data (patch)
     * @return Promise a resulting promise with an error to feed back or data to send on
	 * @example add({ name: <string>, identity: [{ identity: <string>, type: <email|phone> }], account: { password: <string> } });
	 */
	edit(id, data, partial) {
		let userIdentity = new UserIdentityModel();
		let userAccount = new UserAccountModel();
		let uMapped, uiMapped, uaMapped;

		return Promise.resolve().then(() => {
			// map data, checking integrity
			uMapped = this.mapDataToColumn(data, partial);
			uiMapped = userIdentity.mapDataArrayToColumn(data.userIdentity, partial);
			uaMapped = userAccount.mapDataToColumn(data.userAccount, partial);

			// to edit password you must have current password too
			if (uaMapped && uaMapped.password !== undefined && uaMapped.password.length < 1) throw new RestError('Password cannot be empty', 400);
			if (uaMapped && !!uaMapped.password && (!data.userAccount || !data.userAccount.currentPassword)) throw new SystemError('Must include current password when changing password');
		})
			.then(() => {
				if (!uaMapped || uaMapped.password === undefined) return;
				return userAccount.get(id).then((usracc) => {
					if (usracc.password !== Crypto.passwordHash(data.userAccount.currentPassword, usracc.password.substring(0, usracc.password.length / 2))) throw new SystemError('Current password is incorrect, unable to change password');
				});
			})
			.catch((error) => {
				// manage error, parse and re-throw
				if (error.name === 'SystemError') throw new SystemError(error.message, {
					user: {
						...this.columns,
						userIdentity: [userIdentity.columns],
						userAccount: {
							...userAccount.columns,
							currentPassword: {
								"type": "string",
								"required": true,
								"description": "Current user password"
							}
						}
					}
				});
				throw error;
			}).then(() => {
				// perform edit user, identities and account data, rollback on failure
				return this.transaction((trx) => {
					return Promise.resolve()
						.then(() => {
							if (uMapped) return this.transactUpdate(trx, id, uMapped, '*');
							return this.get(id);
						})
						.then((usr) => {
							// update identities attached to this user
							if (uiMapped && uiMapped.length > 0) {
								let identities = [];
								for (let i = 0; i < data.userIdentity.length; i++) {
									identities.push(
										userIdentity.transactUpdate(trx, { id: data.userIdentity[i].id, user_id: id }, uiMapped[i], ['id', 'identity', 'type', 'primary'])
									);
								}

								// splice id into error response, dont want it in normally but we are updating from user resource for convenience!
								return Promise.all(identities).then((uis) => ({ ...usr, ...{ userIdentity: uis.map((ui) => ui[0]) } }))
									.catch((error) => {
										throw new SystemError('Invalid data, could not update record', {
											...userIdentity.parseError(error), userIdentity: {
												...userIdentity.columns, "id": {
													"type": "uuid",
													"required": true,
													"description": "User identity ID"
												}
											}
										});
									});
							}

							return usr;
						})
						.then((usr) => {
							// update account, only need to use user id here as 1 to 1 table. dont return anything
							if (uaMapped) {
								uaMapped.password = Crypto.passwordHash(uaMapped.password);
								return userAccount.transactUpdate(trx, { user_id: id }, uaMapped)
									.then(() => usr)
									.catch((error) => {
										throw new SystemError('Invalid data, could not add record', { ...userAccount.parseError(error), userAccount: userAccount.columns });
									});
							}

							return usr;
						})
						.then((usr) => ({ id: usr.id, name: usr.name, active: usr.active, userIdentity: usr.userIdentity }))
						.then(trx.commit)
						.catch(trx.rollback);
				});
			});
	}
}

module.exports = User;