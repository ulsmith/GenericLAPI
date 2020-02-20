'use strict';

const html = (...props) => props[0].reduce((acc, cur, idx) => acc + props[idx] + cur);

const PasswordReset = (props) => html`
	<h1>Boom</h1>
	<p>Hello ${props.name} how are <strong>YOU</strong> doing you ${props.age}.</p>
`;

module.exports = PasswordReset;

// const Email = require('./Email.js');

// /**
//  * @namespace API/View/Email
//  * @class Controller
//  * @extends Email
//  * @description System class to give a base for creating controllers, exposing services and base methods
//  * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
//  * @copyright 2020 Paul Smith (ulsmith) all rights reserved
//  * @license MIT 
//  */
// class Controller extends Email {

// 	/**
// 	 * @public @method constructor
// 	 * @description Base method when instantiating class
// 	 */
// 	constructor() {
// 		super();
// 	}


// }

// module.exports = Controller;

