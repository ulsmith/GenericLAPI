'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email
 * @class YourAlreadyAUserHtml
 * @description Reminder to say your already a member
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const YourAlreadyAUserHtml = (props) => DataTools.html`
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
		<h1 class="title">Your Already A User ${props.name}!</h1>
	</div>
	<div class="main">
		<p>You just tried to create an account at <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>, but your already a member.</p>
		<p>If this was not you that requested this, you may ignore this message; new registrations expire after ${props.expireTime} minutes automatically.</p>
		<p>If you did make this request, thats good too, but you just need to go to the website and log in.</p>
		<p>To reset your password, in the event you forgot it, just click the link in the login screen and add your identity, we will then send it to you via this means.</p>
		<p class="text-center"><a href="${props.link}" class="text-button">${props.systemName}</a></p>
		<p class="text-center text-link">${props.link}</p>
		<p>Thanks again for using ${props.systemName}!</p>
		<p class="signature">The ${props.systemName} Team.</p>
	</div>
	<div class="footer">
		<p>${props.systemName}</p>
	</div>
`;

/**
 * @namespace API/View/Email
 * @class YourAlreadyAUserText
 * @description Reminder to say your already a member
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const YourAlreadyAUserText = (props) => DataTools.text`
	Your Already A User ${props.name}!


	You just tried to create an account at ${props.systemName} [${props.systemUrl}], but your already a member.
	
	If this was not you that requested this, you may ignore this message; new registrations expire after ${props.expireTime} minutes automatically.
	
	If you did make this request, thats good too, but you just need to go to the website and log in.
	
	To reset your password, in the event you forgot it, just click the link in the login screen and add your identity, we will then send it to you via this means.
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	${props.link}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { YourAlreadyAUserHtml, YourAlreadyAUserText };