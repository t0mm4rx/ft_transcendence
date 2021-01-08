/*
Entrypoint of the web app.
Every global objects are stored in window (the default browser scope).
*/

import Router from "./Router";
import PageLayout from "./pages/PageLayout";
import UserMenu from "./views/UserMenu";
import { User, Friends, Users } from "./models/User";
import NotificationsPanel from "./views/NotificationsPanel";
import { Notification, NotificationCollection } from "./models/Notification";
import { Game, GameCollection } from "./models/Game";
import ChatPanel from "./views/ChatPanel";
import { Chat, Channel, ChannelMessages, Message } from "./models/Channels";
import $ from "jquery";
import Cookies from "js-cookie";
import { loadCurrentUser, loadUsers } from "./utils/globals";

// Temp game server
// import express from 'express';

// If the token cookie is already set, we use it with ajax for requests
const token = Cookies.get("user");
if (token) {
  $.ajaxSetup({
    headers: { Authorization: `Bearer ${token}` },
  });
}
// When the token changes in the cookies, we set ajax to use it for requests
$(document).on("token_changed", function () {
  console.log("User token changed, we refresh the Ajax headers.");
  const token = Cookies.get("user");
  $.ajaxSetup({
    headers: { Authorization: `Bearer ${token}` },
  });
});

// We create the router, the part of the app which will change the page content according to the URL
window.router = new Router();

// The current user
window.currentUser = new User({ id: "me" });
loadCurrentUser();

// Every users
window.users = new Users();
loadUsers();

// We create our global models
// window.currentUser = new User({
// 	id: 2564,
// 	login: 'tmarx',
// 	displayName: 'Air Marx',
// 	avatar: 'https://cdn.intra.42.fr/users/large_tmarx.jpg'
// });

window.friends = new Friends();
window.friends.add(
  new User({
    login: "emacron",
    displayName: "Manu",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    status: "online",
  })
);
window.friends.add(
  new User({
    login: "magrosje",
    displayName: "Mathis",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    status: "online",
  })
);
window.friends.add(
  new User({
    login: "ljames",
    displayName: "Lebron",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    status: "online - in game",
  })
);
window.friends.add(
  new User({
    login: "frlindh",
    displayName: "Fredrika",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "offline",
  })
);
window.friends.add(
  new User({
    login: "rchallie",
    displayName: "Romain",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    status: "offline",
  })
);

window.liveGames = new GameCollection();
window.liveGames.add(
  new Game({
    player1: "Jean",
    player2: "Romain",
    type: "War game",
  })
);
window.liveGames.add(
  new Game({
    player1: "Fredrika",
    player2: "Mathis",
    type: "Direct game",
  })
);
window.liveGames.add(
  new Game({
    player1: "Manu",
    player2: "Donald",
    type: "Ladder game",
  })
);

window.chat = new Chat();

window.notifications = new NotificationCollection();
window.notifications.add(
  new Notification({
    title: "Romain vous a défier pour un match direct",
    id: Math.random(),
  })
);
window.notifications.add(
  new Notification({ title: "Manu veut être votre amis", id: Math.random() })
);

// Page layout
window.layoutView = new PageLayout().render();

Backbone.history.start();
