'use strict';

const mysql = require('mysql');

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Mysql {
	constructor() {
		this.mysql = mysql;
		this.connection;
	}


// const { Client } = require('pg')
// const client = new Client()
// client.connect()
// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
// 	console.log(err ? err.stack : res.rows[0].message) // Hello World!
// 	client.end()
// })


	connect() {
		this.connection = this.mysql.createConnection({
			host: '10.21.3.46',
			user: 'mysql',
			password: 'mysql',
			database: 'generic'

			// host: '192.168.1.71',
			// user: 'mysql',
			// password: 'mysql',
			// database: 'generic'
		});

		this.connection.connect((error) => {
			if (error) console.log(error);
		});

		console.log('connect');
	}

	disconnect() {
		this.connection.end((err) => {
			if (err) {
				this.connection.destroy();
				console.log('destroyed');
			} else {
				console.log('ended');
			}
		});
	}
}

module.exports = Mysql;