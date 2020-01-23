/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Postgres {
	constructor() {
		this.db = process.__services.postgres.db;
	}

    /**
     * find
     * @param {Number} id The resource id to fetch
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	get(id) {
		return new Promise((resolve, reject) => {
			this.db.query('SELECT * FROM ?? WHERE id = ?', [this.table, id], (error, results) => {
				if (error) return reject(error);
				return resolve(results);
			});
		});
	}

    /**
     * update
     * @param {Number} id The resource id to update
     * @param {Object} data The object data to update on the resource
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
	update(id, data) {
		return new Promise((resolve, reject) => {
			this.db.query('UPDATE ?? SET ? WHERE id = ?', [this.table, data, id], (error, results) => {
				if (error) return reject(error);
				return resolve(results);
			});
		});
	}
}

module.exports = Postgres;