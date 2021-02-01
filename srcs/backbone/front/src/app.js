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
import { Tournaments } from "./models/Tournaments";
import $ from "jquery";
import Cookies from "js-cookie";
import { loadCurrentUser, loadUsers, loadGuilds } from "./utils/globals";
import { Guilds } from "./models/Guild";
import { FtSocket } from "./models/FtSocket";

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

// Guilds
window.guilds = new Guilds();
loadGuilds();


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

if (token) {
	window.chat = new Chat();
	window.tournaments = new Tournaments();
}

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

// Global socket
var globalSocket = new FtSocket({
  channel: "GlobalChannel",
});

globalSocket.socket.onmessage = function (event) {
  const event_res = event.data;
  const msg = JSON.parse(event_res);

  // Ignores pings.
  if (msg.type === "ping") return;

  if (msg.message) {
    if (msg.message.message == "new_client") {
      // Refresh HERE
      console.log("[TMP] New client.");
    }
  }
};

// Send message to everyone
globalSocket.sendMessage(
  {
    action: "to_broadcast",
    infos: {
      message: "new_client",
      content: {},
    },
  },
  false,
  true
);

Backbone.history.start();
