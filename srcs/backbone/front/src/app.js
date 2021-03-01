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
import ChatPanel from "./views/Chat";
import { Chat } from "./models/Chat";
import { Tournaments, PermanentTournament } from "./models/Tournaments";
import $ from "jquery";
import Cookies from "js-cookie";
import {
  loadCurrentUser,
  loadUsers,
  loadGuilds,
  loadWars,
} from "./utils/globals";
import { Guilds } from "./models/Guild";
import { FtSocket } from "./models/FtSocket";
import toasts from "./utils/toasts";
import { Wars } from "./models/War";

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

window.onbeforeunload = (e) => {
  window.currentUser.save("status", "offline");
  window.router.closeGame();
  // return 'plop';
};

// window.addEventListener('close', function (e) {
//   window.router.closeGame(window.currentView);
//   e.preventDefault();
//   e.returnValue = '';
// });
// Backbone.Events.once('windowClosed', window.router.closeGame());

// window.addEventListener('beforeunload', window.router.closeGame());

// The current user
window.currentUser = new User({ id: "me" });
loadCurrentUser();

// Every users
window.users = new Users();
loadUsers();

// Guilds
window.guilds = new Guilds();
loadGuilds();

// Wars
window.wars = new Wars();
loadWars();

window.liveGames = new GameCollection();

if (token) {
  window.chat = new Chat();
  window.tournaments = new Tournaments();
  window.permanentTournament = new PermanentTournament();
}

window.notifications = new NotificationCollection();

// Page layout
window.layoutView = new PageLayout().render();


Backbone.history.start();
