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
import ChatPanel from './views/ChatPanel';
import {Chat, Channel} from './models/Channels';

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
	login: 'emacron',
	displayName: 'Manu',
	avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
	status: 'online'
}));
window.friends.add(new User({
	login: 'magrosje',
	displayName: 'Mathis',
	avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
	status: 'online'
}));
window.friends.add(new User({
	login: 'ljames',
	displayName: 'Lebron',
	avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
	status: 'online - in game'
}));
window.friends.add(new User({
	login: 'frlindh',
	displayName: 'Fredrika',
	avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
	status: 'offline'
}));
window.friends.add(new User({
	login: 'rchallie',
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

window.chat = new Chat();
window.chat.add(new Channel({
	name: 'Magrosje',
	avatar: "https://randomuser.me/api/portraits/men/11.jpg",
	messages: [
		{from: "magrosje", date: new Date().getTime() - 60, message: "Hello"},
		{from: "tmarx", date: new Date().getTime() - 23, message: "Yo"},
		{from: "tmarx", date: new Date().getTime() - 12, message: "Dis-moi quand tu veux jouer"},
		{from: "magrosje", date: new Date().getTime() - 6, message: "Dans 5 minutes"},
		{from: "magrosje", date: new Date().getTime() - 2, message: "*10"}
	]
}));
window.chat.add(new Channel({
	name: 'International killer team',
	avatar: null,
	messages: [
		{from: "magrosje", date: new Date().getTime() - 60, message: "Hello to the team"},
		{from: "frlindh", date: new Date().getTime() - 23, message: "🔥"},
		{from: "rchallie", date: new Date().getTime() - 12, message: "Has the tournament started yet?"},
		{from: "tmarx", date: new Date().getTime() - 2, message: "Nop"},
		{from: "tmarx", date: new Date().getTime() - 2, message: "Test"},
		{from: "frlindh", date: new Date().getTime() - 2, message: "To get the scroll"},
		{from: "frlindh", date: new Date().getTime() - 2, message: "To get the scroll"},
		{from: "frlindh", date: new Date().getTime() - 2, message: "To get the scroll"},
		{from: "frlindh", date: new Date().getTime() - 2, message: "To get the scroll"},
		{from: "frlindh", date: new Date().getTime() - 2, message: "To get the scroll"},
	]
}));

window.notifications = new NotificationCollection();
window.notifications.add(new Notification({title: "Romain vous a défier pour un match direct", id: Math.random()}));
window.notifications.add(new Notification({title: "Manu veut être votre amis", id: Math.random()}));

// Page layout
window.layoutView = new PageLayout().render();

Backbone.history.start();