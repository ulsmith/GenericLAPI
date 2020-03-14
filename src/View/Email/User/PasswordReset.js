'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email
 * @class PasswordResetHtml
 * @description Password reset email to send out to users, splice in properties as template literals
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const PasswordResetHtml = (props) => DataTools.html`
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
		<h1 class="title">Hi ${props.name}!</h1>
	</div>
	<div class="main">
		<p>We have had a password reset request come through for your account on <strong><a href="${props.systemUrl}">${props.systemName}</a></strong></p>
		<p>If this was not you that requested this, you may ignore this message; password requests expire after ${props.expireTime} minutes so don't panic, your all secure.</p>
		<p>If you did make this request, great; simply use the button below to access our system and change your password.</p>
		<p>Its always a good idea to check the domain password reset point you to, make sure it matches the website when others send you requests!</p>
		<p class="text-center"><a href="${props.token}" class="text-button">Reset your Passsword</a></p>
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
 * @class PasswordResetText
 * @description Password reset email to send out to users, splice in properties as template literals
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const PasswordResetText = (props) => DataTools.text`
	Hi ${props.name}!


	We have had a password reset request come through for your account on ${props.systemName} [${props.systemUrl}]
	
	If this was not you that requested this, you may ignore this message; password requests expire after ${props.expireTime} minutes so don't panic, your all secure.
	
	If you did make this request, great; simply use the button below to access our system and change your password.
	
	Its always a good idea to check the domain password reset point you to, make sure it matches the website when others send you requests!
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	${props.token}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { PasswordResetHtml, PasswordResetText };