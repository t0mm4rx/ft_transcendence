/* Here we define the routes and pages of our application. */

import Backbone from 'backbone';
import Guilds from './pages/Guilds';
import Home from './pages/Home';
import Game from './pages/Game';
import Tournaments from './pages/Tournaments';
import Test from './pages/Test';

export default Backbone.Router.extend({
	routes: {
		"": "home",
		"home": "home",
		"home/": "home",
		"user/:id": "user",
		"user/:id/": "user",
		"guilds": "guilds",
		"guilds/": "guilds",
		"game": "game",
		"game/": "game",
		"tournaments": "tournaments",
		"tournaments/": "tournaments",
		"test": "test",
		"test/": "test",
	},
	home: function () {
		new Home().render();
	},
	user: function (id) {
		console.log(id);
		console.log("User view");
	},
	guilds: function () {
		new Guilds().render();
	},
	game: function () {
		new Game().render();
	},
	tournaments: function () {
		new Tournaments().render();
	},
	test: function () {
		new Test().render();
	},
});