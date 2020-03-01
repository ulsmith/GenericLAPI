'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email
 * @class RegistrationHtml
 * @description Registration email
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationHtml = (props) => DataTools.html`
	<style>
		* { font-family: arial, sans-serif; }
		body { background-color: #ccc; }
		.header { padding: 20px; background-color: #444; }
		.main { padding: 20px; background-color: #eee; }
		.footer { padding: 20px; }
		.title { color: #ddd; }
		p { font-size: 18px; color: #555; }
		.text-center { text-align: center; }
		.text-link { color: grey; font-style: italic; font-weight: bold; }
		.text-button { padding: 20px; display: inline-block; background-color: #4848c7; margin: 10px; color: white; text-decoration: none; font-size: 20px; }
		.signature { font-size: 20px; color: #222; }
	</style>

	<div class="header">
		<h1 class="title">Welcome!</h1>
	</div>
	<div class="main">
		<p>This identity (email) just registered for an account at <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>, so hi there!</p>
		<p>If this was not you that requested this, you may ignore this message; new registrations expire after 10min.</p>
		<p>If you keep getting these emails, someone is trying to register your email on our system.</p>
		<p>If you did make this request, thats great, we just need you to verify your identity by clicking the link to confirm.</p>
		<p class="text-center"><a href="${props.token}" class="text-button">Verify your Email</a></p>
		<p class="text-center text-link">${props.token}</p>
		<p>Thanks again for using ${props.systemName}!</p>
		<p class="signature">The ${props.systemName} Team.</p>
	</div>
	<div class="footer">
		<p>${props.systemName}</p>
	</div>
`;

/**
 * @namespace API/View/Email
 * @class RegistrationText
 * @description Registration email
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationText = (props) => DataTools.text`
	Welcome!


	This identity (email) just registered for an account at ${props.systemName} [${props.systemUrl}], so hi there!
	
	If this was not you that requested this, you may ignore this message; new registrations expire after 24hours.
	
	If you keep getting these emails, someone is trying to register your email on our system.
	
	If you did make this request, thats great, we just need you to verify your identity by clicking the link to confirm.
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	${props.token}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { RegistrationHtml, RegistrationText };