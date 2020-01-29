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
     * @public @method getFromUUID
     * @description Get user data from UUID of user, pushed direct to UI
     * @param {String} guid The GUID to search for
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
				'identity.user.id',
				'identity.user.uuid',
				'identity.user.name',
				'identity.user.active',
				'identity.user_account.user_agent',
				'identity.user_account.login_current',
				'identity.user_account.login_previous'
			)
			.from('identity.user')
			.join('identity.user_identity', 'identity.user.id', 'identity.user_identity.user_id')
			.join('identity.user_account', 'identity.user.id', 'identity.user_account.user_id')
			.where('identity.user.uuid', uuid)
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getAuthedFromEmail
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
	 * AND "identity".user_identity.type = 'email'
	 * LIMIT 1;
     */
	getAuthedFromEmail(email, password) {
		return this.db
			.select(
				'identity.user.id',
				'identity.user.uuid',
				'identity.user.name',
				'identity.user.active',
				'identity.user_account.password',
				'identity.user_account.login_current',
				'identity.user_account.login_previous'
			)
			.from('identity.user')
			.join('identity.user_identity', 'identity.user.id', 'identity.user_identity.user_id')
			.join('identity.user_account', 'identity.user.id', 'identity.user_account.user_id')
			.where('identity.user_identity.identity', email)
			.andWhere('identity.user_identity.type', 'email')
			.limit(1)
			.then((data) => data[0] || undefined);
	}

    /**
     * @public @method getAllPermisions
     * @description Get permissions for a user, along with role name
     * @param {Number} user_id The id of the user to search for
     * @param {Number} organisation_id The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name" AS "role"
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
	 * GROUP BY "identity".role.name
	 * ORDER BY "identity".role.name;
     */
	getAllPermisions(user_id, organisation_id) {
		return this.db
			.select(
				'role.name AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', user_id).andOn('user_department.department_organisation_id', '=', organisation_id) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.groupBy('role.name')
			.orderBy('role.name', 'ASC');
	}

    /**
     * @public @method getAllPermisions
     * @description Get permissions starting with match, for a user, along with role name
     * @param {String} match The partial match for the role name
     * @param {Number} user_id The id of the user to search for
     * @param {Number} organisation_id The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name" AS "role"
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
	 * WHERE "role"."name" LIKE '...%'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY "identity".role.name
	 * ORDER BY "identity".role.name;
     */
	getPermisions(match, user_id, organisation_id) {
		return this.db
			.select(
				'role.name AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', user_id).andOn('user_department.department_organisation_id', '=', organisation_id) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.where('role.name', 'LIKE', match + '%')
			.groupBy('role.name')
			.orderBy('role.name', 'ASC');
	}

    /**
     * @public @method getPermision
     * @description Get a permission for a user, along with role name
     * @param {String} match The full match for the role name
     * @param {Number} user_id The id of the user to search for
     * @param {Number} organisation_id The id of the organisation to search for
     * @return Promise a resulting promise with an error to feed back or data to send on
	 *
	 * SELECT
	 *	"role"."name" AS "role"
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
	 * WHERE "role"."name" = '...'
	 * -- group them and combine permissions. will extract any true as true otherwise fasle. permissions are accumulative
	 * GROUP BY "identity".role.name
	 * LIMIT 1;
     */
	getPermision(match, user_id, organisation_id) {
		return this.db
			.select(
				'role.name AS role',
				this.db.raw('COALESCE(bool_or(user_role.read) OR bool_or(department_role.read) OR bool_or(user_group_role.read) OR bool_or(department_group_role.read), FALSE) AS read'),
				this.db.raw('COALESCE(bool_or("user_role"."write") OR bool_or("department_role"."write") OR bool_or("user_group_role"."write") OR bool_or("department_group_role"."write"), FALSE) AS "write"'),
				this.db.raw('COALESCE(bool_or("user_role"."delete") OR bool_or("department_role"."delete") OR bool_or("user_group_role"."delete") OR bool_or("department_group_role"."delete"), FALSE) AS "delete"')
			)
			.from('identity.role')
			.leftJoin('identity.user_department', function () { this.on('user_department.user_id', '=', user_id).andOn('user_department.department_organisation_id', '=', organisation_id) })
			.leftJoin('identity.user_role', function () { this.on('user_role.role_id', '=', 'role.id').andOn('user_role.user_id', '=', 'user_department.user_id') })
			.leftJoin('identity.department_role', function () { this.on('department_role.role_id', '=', 'role.id').andOn('department_role.department_id', '=', 'user_department.department_id') })
			.leftJoin('identity.user_group', 'user_group.user_id', 'user_department.user_id')
			.leftJoin('identity.group_role AS user_group_role', function () { this.on('user_group_role.group_id', '=', 'user_group.group_id').andOn('user_group_role.role_id', '=', 'role.id') })
			.leftJoin('identity.department_group', 'department_group.department_id', 'user_department.department_id')
			.leftJoin('identity.group_role AS department_group_role', function () { this.on('department_group_role.group_id', '=', 'department_group.group_id').andOn('department_group_role.role_id', '=', 'role.id') })
			.where('role.name', match)
			.groupBy('role.name')
			.orderBy('role.name', 'ASC')
			.limit(1);
	}
}

module.exports = User;