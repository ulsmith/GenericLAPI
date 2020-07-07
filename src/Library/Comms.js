'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'eu-west-2' });

/**
 * @namespace API/Library
 * @class Comms
 * @description Common resource element, functional only, providing crypto functionality
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 * @example options for email
 * 	emailSend('jd...com', '"No Reply" <no-reply@rag...com>', 'Test Subject', 'HTML message', 'Optional Alt text message'); // to, from, subject, body, alt
 */
class Comms {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {

	}

	/**
	 * @public @name send
	 * @description send smtp email, must be from a verified email in AWS
	 * @param {String} s The string to hash
	 * @return {String} A hash of the string
	 */
	emailSend(to, from, subject, body, alt) {
		const params = {
			Destination: {
				ToAddresses: typeof to === 'object' && to.length ? to : [to]
			},
			Message: {
				Body: {
					Html: { Charset: "UTF-8", Data: body },
					Text: { Charset: "UTF-8", Data: alt }
				},
				Subject: { Charset: "UTF-8", Data: subject }
			},
			Source: from
		};

		return new Promise((res, rej) => {
			ses.sendEmail(params, function (err, data) {
				if (err) return rej('failed to send');
				else res('sent successfully');
			});
		});
	}
}

module.exports = Comms;

