'use strict';

const Service = require('../System/Service.js');
const ConfigModel = require('../Model/DatabaseName/Public/Configuration.js');

/**
 * @namespace API/Service
 * @class Config
 * @extends Service
 * @description Service class providing configuration access for runtime, user changable config values
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Config extends Service {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();

        this._cache = {};
	}

    /**
     * @public @method cache
	 * @description Cache the config values so they may be fetched without waiting/promise
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	cache() {
		let configModel = new ConfigModel();
        return configModel.all().then((rows) => rows.reduce((a, c) => {
            let b = {};
            b[c.name_unique] = c.data;
            return {...a, ...b};
        }, {})).then((configs) => this._cache = configs);
	}

    /**
     * @public @method get
	 * @description Get a configuration set
     * @param {String} key The key to search for
     * @return {Object} The configuration set, aas an object of values
     */
	get(key) {
		return this._cache[key];
	}

    /**
     * @public @method set
	 * @description The configuration set to update
     * @param {String} key The key for the configuration set
     * @param {Object} value The configuration object for that set
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	set(key, value) {
        this._cache[key] = Object.assign({}, this._cache[key], value);
        let configModel = new ConfigModel();
        return configModel.update({ name_unique: key }, { data: this._cache[key] });
	}
}

module.exports = Config;
