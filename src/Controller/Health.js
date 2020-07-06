'use strict';

const Controller = require('../System/Controller.js');
const HealthModel = require('../Model/Dbduck/Public/Health.js');

/**
 * @namespace API/Controller
 * @class Health
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Health extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
        super();
    }

	/**
	 * @public @static @get access
	 * @desciption Get the access for methods. All methods are restricted by default unless added to { public: [] }. Public methods skip auth middleware
	 * @return {Object} Object of access levels for methods
	 */
    static get get() { return 'public' }

    /**
     * @public @method get
     * @description Ping the system to check whats health and whats not
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	get(event, context) {
		let health = new HealthModel();
		return health.getHealth()
			.then((data) => {
				return { database: data.status || 'error' };
			})
			.catch((data) => { 
				return { database: 'error' };
			})
			.then((data) => {
				data.system = 'healthy';
				data.dateTime = new Date();
				return data;
			});
	}
}

module.exports = Health;
