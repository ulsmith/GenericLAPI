'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email/Admin
 * @class RegistrationCompletedHtml
 * @description Admin based email to tell admin that a user completed their registration and was auto activated
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationCompletedHtml = (props) => DataTools.html`
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
		<p>We have had a new user complete their account registration on <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>.</p>
		<p>This user has been auto activated and requires no further action by you. you can change this setting in the admin settings.</p>
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
 * @class RegistrationCompletedText
 * @description Admin based email to tell admin that a user completed their registration and was auto activated
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const RegistrationCompletedText = (props) => DataTools.text`
	Hi Admin!


	We have had a new user complete their account registration on ${props.systemName} [${props.systemUrl}].
	
	This user has been auto activated and requires no further action by you. you can change this setting in the admin settings.
	
	Type: ${props.identityType}, Identity: ${props.identity}
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { RegistrationCompletedHtml, RegistrationCompletedText };