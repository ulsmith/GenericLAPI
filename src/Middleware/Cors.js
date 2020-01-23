'use strict';

const Middleware = require('../System/Middleware.js');

/**
 * @namespace API/Middleware
 * @class Cors
 * @extends Middleware
 * @description Middleware class providing cors patching to outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Cors extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

    /**
	 * @public @method out
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     * @param {Object} context The lambda context
     */
	out(response, context) {
		// no cors request
		if (!this.$client.origin || !this.$environment.CorsWhitelist) return;

		// work out origin, is it in whitelist
		let origin = this.$environment.CorsWhitelist.replace(' ', '').split(',').indexOf(this.$client.origin) >= 0 ? this.$client.origin : '';

		// update headers on way back out
		response.headers['Access-Control-Allow-Origin'] = origin; // needs to be checked againstwhitelist
		response.headers['Access-Control-Allow-Credentials'] = 'true';
		response.headers['Access-Control-Allow-Headers'] = 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires';
		response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
		response.headers['Access-Control-Expose-Headers'] = 'Cache-Control, Content-Type, Authorization, Pragma, Expires';
		response.headers['P3P'] = 'CP="ALL IND DSP COR ADM CONo CUR CUSo IVAo IVDo PSA PSD TAI TELo OUR SAMo CNT COM INT NAV ONL PHY PRE PUR UNI"';
	}
}

module.exports = Cors;