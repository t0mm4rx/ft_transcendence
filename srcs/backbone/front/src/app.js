/*
Entrypoint of the web app.
Every global objects are stored in window (the default browser scope).
*/

import Router from './Router';
import PageLayout from './pages/PageLayout';
import UserMenu from './views/UserMenu';
import User from './models/User';
import NotificationsPanel from './views/NotificationsPanel';
import {Notification, NotificationCollection} from './models/Notification';
import {Game, GameCollection} from './models/Game';

// We create the router, the part of the app which will change the page content according to the URL
window.router = new Router();

// We create our global models
window.currentUser = new User({
	login: 'tmarx',
	displayName: 'Air Marx',
	avatar: 'https://cdn.intra.42.fr/users/large_tmarx.jpg'
});

window.notifications = new NotificationCollection();
window.notifications.add(new Notification({title: "Romain vous a défier pour un match direct", id: Math.random()}));
window.notifications.add(new Notification({title: "Manu veut être votre amis", id: Math.random()}));

window.liveGames = new GameCollection();
window.liveGames.add(new Game({
	player1: "Jean",
	player2: "Romain",
	type: "War game"
}));
window.liveGames.add(new Game({
	player1: "Fredrika",
	player2: "Mathis",
	type: "Direct game"
}));
window.liveGames.add(new Game({
	player1: "Manu",
	player2: "Donald",
	type: "Ladder game"
}));

// Views on every pages
new PageLayout().render();
new UserMenu({model: window.currentUser}).render();
new NotificationsPanel({model: window.notifications}).render();

Backbone.history.start();