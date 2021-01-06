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
import User from './pages/User';

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
		"auth/": "auth",
		"token": "token",
		"token/": "token",
		":whatever": "notFound",
		":whatever/": "notFound",
	},
	home: function () {
		this.checkLogged();
		this.showLayout();
		new Home().render();
	},
	user: function (id) {
		this.checkLogged();
		this.showLayout();
		new User({login: id}).render();
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
		} else {
			this.hideLayout();
			new Auth().render();
		}
	},
	token: function () {
		$("body").html("You are being redirected...");
		window.sendToken("Secret data");
		window.close();
	},
	notFound: function () {
		window.location.hash = "/";
	},
	/* Check if the user is logged, if not we redirect him to the auth page */
	checkLogged: function () {
		const user = Cookies.get('user');
		if (!user) {
			window.location.hash = "auth/";
		}
	},
	/* Show chat panel, notification panel and other elements only visible when logged */
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
	},
	hideLayout: function () {
		$("#menu").hide();
		if (window.chatPanelView) {
			window.location.reload();
		}
	}
});