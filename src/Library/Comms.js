'use strict';

const nodemailer = require('nodemailer');

/**
 * @namespace API/Library
 * @class Comms
 * @description Common resource element, functional only, providing crypto functionality
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 * @example options for email 
 * 	emailConfigure("smtp.....com", 587, false, "raz...com", "s4r...uhl"); // host, port, secure, user, pass
 * @example send for email
 * 	emailSend('jd...com', '"No Reply" <no-reply@rag...com>', 'Test Subject', 'HTML message', 'Optional Alt text message'); // to, from, subject, body, alt
 */
class Comms {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		this.comms;
	}
	
	/**
	 * @public @static @name send
	 * @description send smtp email
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	emailConfigure(host, port, secure, user, pass) {
		this.comms = nodemailer.createTransport({
			host: host,
			port: port,
			secure: secure, // upgrade later with STARTTLS
			auth: {
				user: user,
				pass: pass
			}
		});
	}

	/**
	 * @public @static @name send
	 * @description send smtp email
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	emailSend(to, from, subject, body, alt) {
		return new Promise((resolve, reject) => {
			let message = { from: from, to: to, subject: subject, text: alt, html: body };
			if (alt) message.text = alt;
			
			this.comms.sendMail(message, (error, info) => {
				if (error) return reject(error);
				return resolve(info);
			});
		});
	}
}

module.exports = Comms;

