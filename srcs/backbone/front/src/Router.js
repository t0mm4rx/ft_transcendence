/* Here we define the routes and pages of our application. */

import Backbone from 'backbone';

export default Backbone.Router.extend({
	routes: {
	   "": "home",
	   "home": "home",
	   "home/": "home",
	},
	home: function () {
		console.log("Home");
	},
});