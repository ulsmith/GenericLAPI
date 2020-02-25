'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class Registration
 * @extends Model
 * @description Model class for identity.registration table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Registration extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('identity.registration');
		// --Table: user
		// CREATE TABLE identity."registration"(
		// 	id serial  NOT NULL,
		// 	created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
		// 	updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
		// 	identity text  NOT NULL,
		// 	identityType user_identity_type  NOT NULL DEFAULT 'email',
		// 	password varchar(255)  NOT NULL,
		// 	token text  NULL,
		// 	token_sent timestamp  NULL,
		// 	ip_address cidr  NULL,
		// 	user_agent text  NULL,
		// 	CONSTRAINT registration_ak_1 UNIQUE(identity, identityType) NOT DEFERRABLE  INITIALLY IMMEDIATE,
		// 	CONSTRAINT identity__registration__primary_key PRIMARY KEY(id)
		// );

		// CREATE INDEX registration_idx_1 on identity.registration(identity ASC, identityType ASC);

		// CREATE TRIGGER updated__registration BEFORE UPDATE ON "identity"."registration" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;
	}

    /**
	 * @public @get @method columns
	 * @description Columns that we allow to be changed through requests to API
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			identity: { type: 'string', required: true, description: 'User identity' },
			type: { type: 'enum[email][phone]', required: true, description: 'User identity type' },
			password: { type: 'string', required: true, description: 'User password' }
		};
	}
}

module.exports = Registration;