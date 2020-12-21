/*
 Entrypoint of the web app.
*/

import Router from './Router';
import PageLayout from './views/PageLayout';
import UserMenu from './views/UserMenu';
import User from './models/User';

window.router = new Router();

window.currentUser = new User({
	login: 'tmarx',
	displayName: 'Air Marx',
	avatar: 'https://cdn.intra.42.fr/users/large_tmarx.jpg'
});

// Views on every pages
new PageLayout().render();
new UserMenu({model: window.currentUser}).render();

Backbone.history.start();