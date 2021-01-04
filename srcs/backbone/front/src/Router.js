/* Here we define the routes and pages of our application. */

import Backbone from 'backbone';
import Guilds from './pages/Guilds';
import Home from './pages/Home';
import Game from './pages/Game';
import Tournaments from './pages/Tournaments';
import Test from './pages/Test';
import Auth from './pages/Auth';
import NotificationsPanel from './views/NotificationsPanel';
import ChatPanel from './views/ChatPanel';
import UserMenu from './views/UserMenu';
import Cookies from 'js-cookie';
import $ from 'jquery';

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
		"auth": "auth",
		"auth/": "auth"
	},
	home: function () {
		this.checkLogged();
		this.showLayout();
		console.log(window.chatPanelView);
		new Home().render();
	},
	user: function (id) {
		console.log(id);
		console.log("User view");
	},
	guilds: function () {
		this.checkLogged();
		this.showLayout();
		new Guilds().render();
	},
	game: function () {
		this.checkLogged();
		this.showLayout();
		new Game().render();
	},
	tournaments: function () {
		this.checkLogged();
		this.showLayout();
		new Tournaments().render();
	},
	test: function () {
		this.checkLogged();
		this.showLayout();
		new Test().render();
	},
	auth: function () {
		if (!!Cookies.get('user')) {
			window.location.hash = "/";
		}
		$("#menu").hide();
		new Auth().render();
	},
	checkLogged: function () {
		const user = Cookies.get('user');
		if (!user) {
			window.location.hash = "auth/";
		}
	},
	/* Only if we are logged we show the chat panel, notification panel, and menus*/
	showLayout: function () {
		$("#menu").show();
		if (!window.userMenuView)
		{
			window.userMenuView = new UserMenu({model: window.currentUser});
			window.userMenuView.render();
		}
		if (!window.notificationPanelView)
		{
			window.notificationPanelView = new NotificationsPanel({model: window.notifications});
			window.notificationPanelView.render();
		}
		if (!window.chatPanelView)
		{
			window.chatPanelView = new ChatPanel({model: window.chat});
			window.chatPanelView.render();
		}
	}
});