'use strict';

const Model = require('../../System/Model.js');

/**
 * @namespace API/Model/Identity
 * @class Organisation
 * @extends Model
 * @description Model class for identity.organisation table
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Organisation extends Model {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super('identity.organisation');
	}

    /**
	 * @public @get @method columns
	 * @description Columns that we allow to be changed through requests to API
     * @return {Object} The columns data that are accessable
     */
	get columns() {
		return {
			active: { type: 'boolean', required: false, description: 'Organisation is active' },
			name: { type: 'string', required: true, description: 'Friendly organisation name' },
			name_unique: { type: 'string', required: true, description: 'Unique organisation name' },
			description: { type: 'string', required: true, description: 'Basic short description of organisation' }
		};
	}

    /**
	 * @public @method getFromUUID
	 * @description Get a single resource in a single table by table id
     * @param {String} uuid The resource uuid to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	getFromUUID(uuid) { return this.model.where({ uuid: uuid }).limit(1).then((data) => data[0] || {}).catch(() => { return {}}) }
}

module.exports = Organisation;