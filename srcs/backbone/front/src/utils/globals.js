import Cookies from "js-cookie";
import toasts from "./toasts"
import { FtSocket } from "../models/FtSocket"

/**
 * Create a connection with the global socket
 * room and setup message treatment.
 */
const connectGlobalSocket = () => {

  // The connection doesn't exist or isn't established.
  if ((!window.globalSocket
    || !window.globalSocket.socket
    || window.globalSocket.socket.readyState === WebSocket.CLOSED
    || window.globalSocket.socket.readyState === WebSocket.CLOSING)
    && window.currentUser.get('id') !== "me")
  {
  // Connection to Global socket.
  window.globalSocket = new FtSocket({
    channel: "GlobalChannel",
    user_id: window.currentUser.get('id')
  });

  // Setup message treatment.
  window.globalSocket.socket.onmessage = function (event) {

    const event_res = event.data;
    const msg = JSON.parse(event_res);

    // Ignores pings.
    if (msg.type === "ping") return;

    if (msg.message) {

      // New client so refresh current user informations.
      if (msg.message.message == "new_client") {
        window.currentUser.fetch();
      
      // The message is detinated to the user.
      } else if (msg.message.content.request_to == window.currentUser.get("id")) {

        // Another player accept a game request.
        if (msg.message.message == "game_request_reply") {
          toasts.notifySuccess("Start game !");
          window.location.hash = "game_live/" + msg.message.content.gameid;
          return;
        }
        
        window.currentUser.fetch();
        
        // Get a friend request.
        if (msg.message.message == "friend_request")
          toasts.notifySuccess(
            "Friend request received from " + msg.message.content.from.login
          );
        
        // Get a game refresh.
        else if (msg.message.message == "game_request")
          toasts.notifySuccess(
            "Game request received from " + msg.message.content.from.login
          );
        }
      }
    };
  }
}

const loadCurrentUser = (
  success = () => {
    connectGlobalSocket();
  },
  error = (data, state) => {
	  if (state.status === 401) {
		Cookies.remove('user');
		window.location.hash = "/";
	  }
    console.log(state.responseJSON.error);
  }
) => {
  if (window.currentUser.status !== 200 && !!Cookies.get("user"))
    window.currentUser.fetch({
      success: success,
      error: error,
    });
};

const loadUsers = () => {
  if (window.users.status !== 200 && !!Cookies.get("user"))
    window.users.fetch();
};

const loadGuilds = () => {
  if (window.guilds.status !== 200 && !!Cookies.get("user"))
    window.guilds.fetch();
};

const loadWars = () => {
	if (window.wars.status !== 200 && !!Cookies.get("user"))
		window.wars.fetch();
};

const logout = () => {
  Cookies.remove("user");
  window.location.reload();
};

export { connectGlobalSocket, loadCurrentUser, loadUsers, loadGuilds, logout, loadWars };
