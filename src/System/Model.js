'use strict';

const Core = require('./Core.js');

/**
 * @namespace API/System
 * @class Model
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Model extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(table) {
		super();

		this.table = table;
	}

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db() { return this.$services.knex }

	/**
	 * @private @get model
	 * @description Get the service locked to table set in this.table
	 * @return {Knex}, locked to table if set in child model
	 */
	get model() {
		if (!this.table) throw new Error(`Cannot call base model method without setting this.table property in ${this.constructor.name} model`);
		return this.db.table(this.table);
	}
	
    /**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
     * @param {Number} id The resource id to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	get(id) { return this.model.where({id: id}).limit(1) }

    /**
     * @public @method find
	 * @description Find one or more resources from a where object in a single table
     * @param {Object} where The where object as key value, or knex style where object
     * @return {Promise} a resulting promise of data or error on failure
     */
	find(where) { return this.model.where(where) }

    /**
     * @public @method insert
	 * @description Insert a single resource in a single table, clear any default data (id, created, updated)
     * @param {Object} data The object data to insert into the resource as {key: value}
     * @return {Promise} a resulting promise of data or error on failure
     */
	insert(data) { 
		return this.model.insert(this.__cleanIncommingData(data));
	}

    /**
     * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
     * @param {Number} id The resource id to update
     * @param {Object} data The object data to update on the resource as {key: value}
     * @return {Promise} a resulting promise of data or error on failure
     */
	update(id, data) { return this.model.where({ id: id }).update(this.__cleanIncommingData(data)) }

    /**
     * @public @method delete
	 * @description Delete a single resource in a single table by table id
     * @param {Number} id The resource id to delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	delete(id) { return this.model.where({ id: id }).delete() }

    /**
     * @public @method softDelete
	 * @description Soft delete a single resource from a table that has a corresponding backup table, pushing the value to that table
     * @param {Number} id The resource id to soft delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	softDelete(id) { 
		return this.model.where({ id: id })
			.then((data) => {
				if (!data[0]) throw Error('Cannot soft delete record, record does not exist in original table');
				return data[0];
			})
			.then((data) => this.db.table('deleted.' + this.table.replace('.', '___')).insert(data))
			.then(() => this.delete(id));
	}

    /**
     * @public @method softRestore
	 * @description Soft restore a single resource in a single table that has been soft deleted
     * @param {Number} id The resource id to soft restore
     * @return {Promise} a resulting promise of data or error on failure
     */
	softRestore(id) {
		return this.db.table('deleted.' + this.table.replace('.', '___')).where({ id: id })
			.then((data) => {
				if (!data[0]) throw Error('Cannot soft restore record, record does not exist deleted table');
				return data[0];
			})
			.then((data) => this.model.insert(data))
			.then(() => this.db.table('deleted.' + this.table.replace('.', '___')).where({ id: id }).delete(id));
	}

    /**
     * @private @method __cleanIncommingData
	 * @description Clean any incomming data free of default values set by the DB directly
     * @param {Object} data The resource id to delete
     * @return {Object} The cleaned data object
     */
	__cleanIncommingData(data) {
		let cleaned = Object.assign({}, data);
		
		if (cleaned.id) delete cleaned.id;
		if (cleaned.created) delete cleaned.created;
		if (cleaned.updated) delete cleaned.updated;

		return cleaned;
	}
}

module.exports = Model;