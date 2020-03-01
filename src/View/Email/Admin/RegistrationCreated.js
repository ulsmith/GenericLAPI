'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email/Admin
 * @class RegistrationCreatedHtml
 * @description Admin based email to tell admin that a new user started the registration process but needs to verify their account
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationCreatedHtml = (props) => DataTools.html`
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
		<h1 class="title">Hi Admin!</h1>
	</div>
	<div class="main">
		<p>We have had a new user register on <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>, they need to verify their identity.</p>
		<p>Once they have completed verification, you will either get an activation request or be informed about their completion. You can change this setting in the admin settings.</p>
		<p class="text-center text-link">Type: ${props.identityType}, Identity: ${props.identity}</p>
		<p>Thanks again for using ${props.systemName}!</p>
		<p class="signature">The ${props.systemName} Team.</p>
	</div>
	<div class="footer">
		<p>${props.systemName}</p>
	</div>
`;

/**
 * @namespace API/View/Email/Admin
 * @class RegistrationCreatedText
 * @description Admin based email to tell admin that a new user started the registration process but needs to verify their account
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationCreatedText = (props) => DataTools.text`
	Hi Admin!


	We have had a new user register on ${props.systemName} [${props.systemUrl}], they need to verify their identity.
	
	Once they have completed verification, you will either get an activation request or be informed about their completion. You can change this setting in the admin settings.
	
	Type: ${props.identityType}, Identity: ${props.identity}
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { RegistrationCreatedHtml, RegistrationCreatedText };