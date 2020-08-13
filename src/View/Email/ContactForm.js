'use strict';

const DataTools = require('../../Library/DataTools.js');

/**
 * @namespace API/View/Email
 * @class ContactFormHtml
 * @description Admin based email to ask them to activate a new verified user
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const ContactFormHtml = (props) => DataTools.html`
	<style>
		* { font-family: arial, sans-serif; }
		body { background-color: #ccc; }
		.header { padding: 20px; background-color: #444; }
		.main { padding: 20px; background-color: #eee; }
		.title { color: #ddd; }
	</style>

	<div class="header">
		<h1 class="title">NO REPLY!</h1>
		<h3 class="title">Use Link Below to Reply</h3>
	</div>
	<div class="main">
		<p>Hi</p>
		<p>We have had a new message on dbduck from ${props.email}, the message is contained below.</p>
		<p><strong>name: ${props.name}</strong></p>
		<p><strong>email: ${props.email}</strong></p>
		<br><br>
		<p>${props.message}</p>
		<br>
		<p>To reply to this message <a href="mailto:${props.email}">CLICK HERE</a></p>
	</div>
`;

/**
 * @namespace API/View/Email
 * @class ContactFormText
 * @description Admin based email to ask them to activate a new verified user
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const ContactFormText = (props) => DataTools.text`
	NO REPLY
	Do not reply to this message, use a new email to the recipient below.

	Hi

	We have had a new message on dbduck from ${props.email}, the message is contained below.

	${props.name}
	${props.email}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	${props.message}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
`;

module.exports = { ContactFormHtml, ContactFormText };