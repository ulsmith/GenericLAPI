'use strict';

const DataTools = require('../../Library/DataTools.js');

/**
 * @namespace API/View/Email/Admin
 * @class RegistrationActivateHtml
 * @description Admin based email to ask them to activate a new verified user
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationActivateHtml = (props) => DataTools.html`
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
		<p>We have had a new user verify their account on <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>, this requires activating by you.</p>
		<p>The new users details are below. If you wish to auto activate all new registrations once verified, please change this in the admin settings.</p>
		<p class="text-center text-link">Type: ${props.identityType}, Identity: ${props.identity}</p>
		<p class="text-center"><a href="${props.token}" class="text-button">Activate User</a></p>
		<p class="text-center text-link">${props.token}</p>
		<p>Thanks again for using ${props.systemName}!</p>
		<p class="signature">The ${props.systemName} Team.</p>
	</div>
	<div class="footer">
		<p>${props.systemName}</p>
	</div>
`;

/**
 * @namespace API/View/Email/Admin
 * @class RegistrationActivateText
 * @description Admin based email to ask them to activate a new verified user
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationActivateText = (props) => DataTools.text`
	Hi Admin!


	We have had a new user verify their account on ${props.systemName} [${props.systemUrl}], this requires activating by you.
	
	The new users details are below. If you wish to auto activate all new registrations once verified, please change this in the admin settings.
	
	Type: ${props.identityType}, Identity: ${props.identity}
		
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	${props.token}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { RegistrationActivateHtml, RegistrationActivateText };