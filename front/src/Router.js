/* Here we define the routes and pages of our application. */

import Backbone from 'backbone';

export default Backbone.Router.extend({
	routes: {
		"": "home",
		"home": "home",
		"home/": "home",
		"user": "user",
		"user/": "user",
		"guilds": "guilds",
		"guilds/": "guilds",
		"direct-game": "direct-game",
		"direct-game/": "direct-game",
		"tournaments": "tournaments",
		"tournaments/": "tournaments",
	},
	home: function () {
		console.log("Home view");
	},
	user: function () {
		console.log("User view");
	},
	guilds: function () {
		console.log("Guilds view");
	},
	"direct-game": function () {
		console.log("Direct game view");
	},
	tournaments: function () {
		console.log("Tournaments view");
	},
});