'use strict';

const knex = require('knex');

/**
 * @namespace API/Service
 * @class Knex
 * @extends knex (the knex base class from npm)
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Knex extends knex {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super({
			client: process.env.KnexEngine,
			connection: {
				host: process.env.KnexHost,
				port: process.env.KnexPort,
				database: process.env.KnexDatabase,
				user: process.env.KnexUsername,
				password: process.env.KnexPassword
			}
		});
	}
}

module.exports = Knex;