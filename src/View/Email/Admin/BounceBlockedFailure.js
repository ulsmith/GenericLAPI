'use strict';

const DataTools = require('../../../Library/DataTools.js');

/**
 * @namespace API/View/Email/Admin
 * @class BounceBlockedFailureHtml
 * @description Admin based email to warn sys admin of bounce block failure
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const BounceBlockedFailureHtml = (props) => DataTools.html`
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
		<p>Bounce block failed with the following data...</p>
		<p>${props.error}</p>
		<p>${JSON.stringify(props.error)}</p>
		<p>${JSON.stringify(props.data)}</p>
	</div>
`;

/**
 * @namespace API/View/Email
 * @class BounceBlockedFailureText
 * @description Admin based email to ask them to activate a new verified user
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
const BounceBlockedFailureText = (props) => DataTools.text`
	NO REPLY
	Do not reply to this message, use a new email to the recipient below.

	Hi

	Bounce block failed with the following data...

	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	${props.error}
		
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	${JSON.stringify(props.error)}
		
	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	${JSON.stringify(props.data)}

	-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
`;

module.exports = { BounceBlockedFailureHtml, BounceBlockedFailureText };