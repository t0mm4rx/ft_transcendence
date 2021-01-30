/* The model representing a user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import globalSocket from "../app"

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
      },
      error: () =>
        toasts.notifyError(`Could not unblock ${this.get("username")}`),
    });
  },
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

export { User, Friends, Users };
