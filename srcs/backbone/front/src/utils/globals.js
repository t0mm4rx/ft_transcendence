import Cookies from "js-cookie";
import toasts from "./toasts"
import { FtSocket } from "../models/FtSocket"

const connectGlobalSocket = () => {
  if (( !window.globalSocket
    || !window.globalSocket.socket
    || window.globalSocket.socket.readyState === WebSocket.CLOSED
    || window.globalSocket.socket.readyState === WebSocket.CLOSING)
    && window.currentUser.get('id') !== "me")
  {
    // Global socket
    window.globalSocket = new FtSocket({
      channel: "GlobalChannel",
      user_id: window.currentUser.get('id')
    });

    console.log("Can send = ", window.globalSocket.cansend);
    window.globalSocket.socket.onmessage = function (event) {
      const event_res = event.data;
      const msg = JSON.parse(event_res);

      // Ignores pings.
      if (msg.type === "ping") return;

      console.log("MSG AEF : ", msg);

      if (msg.message) {
        console.log("MSG (1): ", msg.message.message);
        console.log("CONTENT (1): ", msg.message.content);
        if (msg.message.message == "new_client") {
          // Refresh HERE
          window.currentUser.fetch();
          console.log("[TMP] New client.");
        } else if (msg.message.content.request_to == window.currentUser.get("id")) {
          console.log("(2) MSG : ", msg.message.message);
          console.log("(2) CONTENT : ", msg.message.content);
          //add if accept or not for game & friend request
          if (msg.message.message == "game_request_reply") {
            toasts.notifySuccess("Start game !");
            window.location.hash = "game_live/" + msg.message.content.gameid;
            return;
          }
          window.currentUser.fetch();
          console.log("From : ", msg.message.content.from);
          if (msg.message.message == "friend_request")
            toasts.notifySuccess(
              "Friend request received from " + msg.message.content.from.login
            );
          else if (msg.message.message == "game_request")
            toasts.notifySuccess(
              "Game request received from " + msg.message.content.from.login
            );
          } else if (msg.message.message == "client_quit") {
            console.log("AAAAAAAAAAAA");
            window.currentUser.fetch();
          } else {
            console.log("MSG : ", msg.message.message);
            console.log("CONTENT : ", msg.message.content);
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
