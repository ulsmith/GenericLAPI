'use strict';

/**
 * One class
 * Controller for API access, ping the backend to check authentication
 * @author Paul Smith <?????>
 * @copyright 2018 ulsmith all rights reerved
 */
class Mysql {
	static invoke(event, context, response) {
		if (!response) process.__services.mysql.connect();
		else process.__services.mysql.disconnect();
	}
}

module.exports = Mysql;