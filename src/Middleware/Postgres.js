'use strict';

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Postgres {
	static invoke(event, context, response) {
		if (!response) process.__services.postgres.connect();
		else process.__services.postgres.disconnect();
	}
}

module.exports = Postgres;