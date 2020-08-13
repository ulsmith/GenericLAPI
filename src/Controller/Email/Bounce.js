'use strict';

const Controller = require('../../System/Controller.js');
const Comms = require('../../Library/Comms.js');
const { BounceBlockedFailureHtml, BounceBlockedFailureText } = require('../../View/Email/Admin/BounceBlockedFailure.js');
const EmailBlockedModel = require('../../Model/Dbduck/Public/EmailBlocked.js');

/**
 * @namespace API/Controller/Email
 * @class Bounce
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Bounce extends Controller {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
    constructor() {
		super();

		this.comms = new Comms();
	}

	/**
	 * @public @static @get access
	 * @desciption Get the access for methods. All methods are restricted by default unless added to { public: [] }. Public methods skip auth middleware
	 * @return {Object} Object of access levels for methods
	 */
	static get sqs() { return 'aws:sqs' }

    /**
     * @public @method get
     * @description Ping the system to check whats health and whats not
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	sqs(event, context) {
		let emailBlocked = new EmailBlockedModel();

		return Promise.resolve()
			.then(() => event.parsedBody.bounce.bouncedRecipients.map((e) => ({ email: e.emailAddress, type: 'bounce', data: event.parsedBody.bounce })))
			.then((data) => emailBlocked.insert(data))
			.catch((error) => this.comms.emailSend(this.$environment.EMAIL_TO, this.$environment.EMAIL_FROM, 'Email Bounce Blocked Failure (dbduck)', BounceBlockedFailureHtml({ error: error, data: event.parsedBody }), BounceBlockedFailureText({ error: error })))
			.then(() => '');
	}
}

module.exports = Bounce;