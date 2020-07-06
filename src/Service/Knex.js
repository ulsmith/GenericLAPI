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
	constructor(connection) {
		connection = connection || {};

		super({
			client: connection.engine || process.env.KNEX_ENGINE,
			connection: {
				host: connection.host || process.env.KNEX_HOST,
				port: connection.port || process.env.KNEX_PORT,
				database: connection.database || process.env.KNEX_DATABASE,
				user: connection.username || process.env.KNEX_USERNAME,
				password: connection.password || process.env.KNEX_PASSWORD
			}
		});
	}
}

module.exports = Knex;