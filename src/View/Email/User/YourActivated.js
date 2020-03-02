'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email
 * @class YourActivatedHtml
 * @description Reminder to say your already a member
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const YourActivatedHtml = (props) => DataTools.html`
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
		<h1 class="title">Your Account is Activated ${props.name}!</h1>
	</div>
	<div class="main">
		<p>Your account is now active, you may log in whenever your ready at <strong><a href="${props.systemUrl}">${props.systemName}</a></strong>.</p>
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
 * @class YourActivatedText
 * @description Reminder to say your already a member
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const YourActivatedText = (props) => DataTools.text`
	Your Account is Activated ${props.name}!


	Your account is now active, you may log in whenever your ready at ${props.systemName} [${props.systemUrl}].
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	${props.link}
	
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	Thanks again for using ${props.systemName}!
	
	The ${props.systemName} Team.
	
	.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.
	
	${props.systemName}
	
	'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
`;

module.exports = { YourActivatedHtml, YourActivatedText };