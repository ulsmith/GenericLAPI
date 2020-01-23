'use strict';

const Postgres = require('../Library/Postgres.js');

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class User extends Postgres {
	constructor () {
		super();

		this.table = 'user';
	}

    /**
     * findFromCredentials
     * @param {String} key The resource to fetch with the given key
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	getFromUUID(guid) {



		// const { Client } = require('pg')
		// const client = new Client()
		// client.connect()
		// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
		// 	console.log(err ? err.stack : res.rows[0].message) // Hello World!
		// 	client.end()
		// })









		return new Promise((resolve, reject) => {
			this.db.query('SELECT * FROM user WHERE guid = ?', [guid], (error, results) => {
				if (error) return reject(error);
				return resolve(results[0]);
			});
		});
	}

    /**
     * findFromCredentials
     * @param {String} key The resource to fetch with the given key
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	getFromCredentials(username, password) {

		console.log(333);
		return this.db.connect().then(() => {
			return this.db.query('SELECT * FROM "user"."user"').then((data) => {
				this.db.end(); // promise here !!!!
				return data;
			});
		});
		// return new Promise((resolve, reject) => {
		// 	return resolve([1222]);
		// 	// this.db.connect().then(this.db.query('SELECT * FROM "user"."user"'));
		// });
	}
}

module.exports = User;