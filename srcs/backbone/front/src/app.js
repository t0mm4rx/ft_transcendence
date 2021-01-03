/*
Entrypoint of the web app.
Every global objects are stored in window (the default browser scope).
*/

import Router from './Router';
import PageLayout from './pages/PageLayout';
import UserMenu from './views/UserMenu';
import {User, Friends} from './models/User';
import NotificationsPanel from './views/NotificationsPanel';
import {Notification, NotificationCollection} from './models/Notification';
import {Game, GameCollection} from './models/Game';

// Temp game server
// import express from 'express';

// We create the router, the part of the app which will change the page content according to the URL
window.router = new Router();

// We create our global models
window.currentUser = new User({
	id: 2564,
	login: 'tmarx',
	displayName: 'Air Marx',
	avatar: 'https://cdn.intra.42.fr/users/large_tmarx.jpg'
});

window.friends = new Friends();
window.friends.add(new User({
	login: 'tmarx',
	displayName: 'Manu',
	avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
	status: 'online'
}));
window.friends.add(new User({
	login: 'tmarx',
	displayName: 'Mathis',
	avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
	status: 'online'
}));
window.friends.add(new User({
	login: 'tmarx',
	displayName: 'Lebron',
	avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
	status: 'online - in game'
}));
window.friends.add(new User({
	login: 'tmarx',
	displayName: 'Fredrika',
	avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
	status: 'offline'
}));
window.friends.add(new User({
	login: 'tmarx',
	displayName: 'Romain',
	avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
	status: 'offline'
}));

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

window.notifications = new NotificationCollection();
window.notifications.add(new Notification({title: "Romain vous a défier pour un match direct", id: Math.random()}));
window.notifications.add(new Notification({title: "Manu veut être votre amis", id: Math.random()}));

// Views on every pages
new PageLayout().render();
new UserMenu({model: window.currentUser}).render();
new NotificationsPanel({model: window.notifications}).render();

Backbone.history.start();