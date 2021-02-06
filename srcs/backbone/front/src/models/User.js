/* The model representing a user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import globalSocket from "../app"
import Cookies from "js-cookie";
import { create } from "underscore";

const UserGames = Backbone.Collection.extend({
  initialize(props) {
    this.url = `http://localhost:3000/api/users/${props.id}/games`;
  },
});

const User = Backbone.Model.extend({
  urlRoot: `http://` + window.location.hostname + `:3000/api/users/`,
  save: function (key, value) {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/users/${window.currentUser.get("id")}/`,
      type: "PUT",
      data: `${key}=${value}`,
      success: () => {
        window.currentUser.set(key, value);
      },
    });
  },
  askFriend: function () {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/friends/`,
      type: "POST",
      data: `id=${this.get("id")}`,
      success: () => {
        this.set("relation_to_user", "request sent");

        globalSocket.sendMessage({
          action: "to_broadcast",
          infos: {
            message: "friend_request",
            content: { request_to: this.get("id"), from : { id : window.currentUser.get("id"), login : window.currentUser.get("login")} }
        }}, false, true);

        toasts.notifySuccess("Friend request sent.");
      },
      error: (err) => {
        toasts.notifyError("Cannot send a friend request.");
        console.log(err);
      },
    });
  },
  unfriend: function () {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/friends/${this.get("id")}/`,
      type: "DELETE",
      success: () => {
        this.set("relation_to_user", null);
        if (this.get("login"))
          toasts.notifySuccess(
            `${this.get("login")} is not your friend anymore.`
          );
        else toasts.notifySuccess(`You're not friends anymore.`);

        globalSocket.sendMessage({
          action: "to_broadcast",
          infos: {
            message: "unfriend_request",
            content: { request_to: this.get("id"), from : { id : window.currentUser.get("id"), login : window.currentUser.get("login")}}
        }}, false, true);

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log(err);
      },
    });
  },
  acceptFriend: function () {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/friends/${this.get("id")}`,
      type: "PUT",
      success: () => {
        this.set("relation_to_user", "friends");
        if (this.get("login"))
          toasts.notifySuccess(`${this.get("login")} is now your friend.`);
        else toasts.notifySuccess(`You have a new friend!`);

        globalSocket.sendMessage({
          action: "to_broadcast",
          infos: {
            message: "friend_request_reply",
            content: { request_to: this.get("id"), from : { id : window.currentUser.get("id"), login : window.currentUser.get("login")}}
        }}, false, true);

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log(err);
        toasts.notifyError("An error occured.");
      },
    });
  },
  setTFA: function () {
    $.ajax({
      url: "http://" + window.location.hostname + ":3000/api/tfa",
      type: "POST",
    });
    window.currentUser.fetch();
  },
  block() {
    console.log(this);
    $.ajax({
      url: "http://" + window.location.hostname + ":3000/api/blocked",
      type: "POST",
      data: { target_id: this.id },
      success: () => {
        toasts.notifySuccess(`You just blocked ${this.get("username")}`);
        this.set("blocked", true);
        window.chat.trigger("block");
      },
      error: () =>
        toasts.notifyError(`Could not block ${this.get("username")}`),
    });
  },
  unblock() {
    console.log(this);
    $.ajax({
      url: `http://`+ window.location.hostname + `:3000/api/blocked/${this.id}`,
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`You just unblocked ${this.get("username")}`);
        this.set("blocked", false);
        window.chat.trigger("block");
      },
      error: () =>
        toasts.notifyError(`Could not unblock ${this.get("username")}`),
    });
  },
  banUntil(time) {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/users/${this.id}`,
      type: "PUT",
      data: { banned_until: time },
      success: () => {
        toasts.notifySuccess(
          `You just banned ${this.escape("username")} for ${time} minutes`
        );
        this.set("banned", true);
      },
      error: () =>
        toasts.notifyError(`Could not ban ${this.escape("username")}`),
    });
  },
  askGame(notif)
  {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/game_requests/`,
      type: "POST",
      data: `userid=${window.currentUser.id}&opponentid=${this.get("id")}`,
      success: () => {

        globalSocket.sendMessage({
          action: "to_broadcast",
          infos: {
            message: "game_request",
            content: { request_to: this.get("id"), from : { id : window.currentUser.get("id"), login : window.currentUser.get("login")}}
        }}, false, true);

        if (notif === true)
          toasts.notifySuccess("Game Request send.");
      },
      error: (err) => {
        toasts.notifyError("Cannot send a game request.");
        console.log(err);
      },
    });
  },
  acceptGame(game_request_id)
  {
    console.log("This.id = ", this.id);
    console.log("this.get('id')", this.get("id"));
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/game_requests/${game_request_id}`,
      type: "PUT",
      data: `opponentid=${window.currentUser.id}&userid=${this.get("id")}`,
      success: () => {

          if (this.get("login"))
            toasts.notifySuccess(`${this.get("login")} game request accepted.`);
          else toasts.notifySuccess(`Start game!`);

        fetch(`http://` + window.location.hostname + `:3000/api/game_rooms`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + Cookies.get("user")
          },
          body: JSON.stringify({
            player_id: window.currentUser.get('id'),
            opponent_id: this.get('id'),
            status: "notstarted",
            number_player: 0
          })
        })
        .then(res => res.json())
        .then(createResult => {
          
          //tmp
          if (createResult == null)
          {
            toasts.notifyError("Error during game creation.");
            return ;
          }

          globalSocket.sendMessage({
            action: "to_broadcast",
            infos: {
              message: "game_request_reply",
              content: { request_to: this.get("id"), from : { id : window.currentUser.get("id"), login : window.currentUser.get("login")}, gameid: createResult.id}
          }}, false, true);
          
          window.location.hash = "game_live/" + createResult.id;
        });

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log(err);
        toasts.notifyError("An error occured.");
      },
    });
  }
});

const Users = Backbone.Collection.extend({
  model: User,
  url: "http://" + window.location.hostname + ":3000/api/users?limit=20",
  // parse: function (data) {
  // 	data.forEach(el => {
  // 		this.add(new User(el));
  // 	});
  // }
});

const Friends = Backbone.Collection.extend({});

export { User, Friends, Users, UserGames };
