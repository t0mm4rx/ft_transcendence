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
import { loadCurrentUser, loadUsers, loadGuilds, loadWars } from "./utils/globals";
import { Guilds } from "./models/Guild";
import { FtSocket } from './models/FtSocket'
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
  window.permanentTournament = new PermanentTournament();
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
    else if (msg.message.content.request_to == window.currentUser.get("id"))
    {
      console.log("(2) MSG : ", msg.message.message);
      console.log("(2) CONTENT : ", msg.message.content);
      //add if accept or not for game & friend request
      if (msg.message.message == "game_request_reply")
      {
          toasts.notifySuccess("Start game !");
          window.location.hash = "game_live/" + msg.message.content.gameid;
          return;
      }
      window.currentUser.fetch();
      console.log("From : ", msg.message.content.from);
      if (msg.message.message == "friend_request")
        toasts.notifySuccess("Friend request received from " + msg.message.content.from.login);
      else if (msg.message.message == "game_request")
        toasts.notifySuccess("Game request received from " + msg.message.content.from.login);  
    }
    else 
    {
      console.log("MSG : ", msg.message.message);
      console.log("CONTENT : ", msg.message.content);
    }
  }
};

console.log("Current user id : ", window.currentUser.id);



console.log("Current user : ", window.currentUser);

window.globalSocket = globalSocket;

export default globalSocket;

Backbone.history.start();
