'use strict';

const Controller = require('../../System/Controller.js');
const Comms = require('../../Library/Comms.js');
const { ContactFormHtml, ContactFormText } = require('../../View/Email/ContactForm.js');

/**
 * @namespace API/Controller/Email
 * @class ContactUs
 * @extends Controller
 * @description Controller class exposing methods over the routed endpoint
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class ContactUs extends Controller {

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
    static get post() { return 'public' }

    /**
     * @public @method get
     * @description Ping the system to check whats health and whats not
     * @param {*} event The event that caused the controller to run
     * @param {*} context The context of the invocation from AWS lambda
     * @return Promise a response promise resolved or rejected with a raw payload or {status: ..., data: ..., headers: ...} payload
     */
	post(event, context) {
		if (
			!/^https?:\/\/localhost:?8082$/.test(event.headers.Origin)
			&& !/^https?:\/\/dbduck\.net:?[0-9]*$/.test(event.headers.Origin)
			&& !/^https?:\/\/testing\.dbduck\.net:?[0-9]*$/.test(event.headers.Origin)
		) return "Thanks for sending your message.";
		
		if (!event.parsedBody.email || !event.parsedBody.name || !event.parsedBody.message || event.parsedBody.robot) return "Thanks for sending your message.";
			
		const data = event.parsedBody;
		const emailData = {
			email: data.email,
			name: data.name,
			message: data.message
		};

		return this.comms.emailSend(this.$environment.EMAIL_TO, this.$environment.EMAIL_FROM, 'Contact Form (dbduck)', ContactFormHtml(emailData), ContactFormText(emailData))
			.then(() => "Thanks for sending your message..")
			.catch(() => "Thanks for sending your message...");
	}
}

module.exports = ContactUs;
