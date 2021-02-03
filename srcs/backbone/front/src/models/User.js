/* The model representing a user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const UserGames = Backbone.Collection.extend({
  initialize(props) {
    this.url = `http://localhost:3000/api/users/${props.id}/games`;
  },
});

const User = Backbone.Model.extend({
  urlRoot: `http://localhost:3000/api/users/`,
  save: function (key, value) {
    $.ajax({
      url: `http://localhost:3000/api/users/${window.currentUser.get("id")}/`,
      type: "PUT",
      data: `${key}=${value}`,
      success: () => {
        window.currentUser.set(key, value);
      },
    });
  },
  askFriend: function () {
    $.ajax({
      url: `http://localhost:3000/api/friends/`,
      type: "POST",
      data: `id=${this.get("id")}`,
      success: () => {
        this.set("relation_to_user", "request sent");
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
      url: `http://localhost:3000/api/friends/${this.get("id")}/`,
      type: "DELETE",
      success: () => {
        this.set("relation_to_user", null);
        if (this.get("login"))
          toasts.notifySuccess(
            `${this.get("login")} is not your friend anymore.`
          );
        else toasts.notifySuccess(`You're not friends anymore.`);
        window.currentUser.fetch();
      },
      error: (err) => {
        console.log(err);
      },
    });
  },
  acceptFriend: function () {
    $.ajax({
      url: `http://localhost:3000/api/friends/${this.get("id")}`,
      type: "PUT",
      success: () => {
        this.set("relation_to_user", "friends");
        if (this.get("login"))
          toasts.notifySuccess(`${this.get("login")} is now your friend.`);
        else toasts.notifySuccess(`You have a new friend!`);
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
      url: "http://localhost:3000/api/tfa",
      type: "POST",
    });
    window.currentUser.fetch();
  },
  block() {
    console.log(this);
    $.ajax({
      url: "http://localhost:3000/api/blocked",
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
      url: `http://localhost:3000/api/blocked/${this.id}`,
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
      url: `http://localhost:3000/api/users/${this.id}`,
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
});

const Users = Backbone.Collection.extend({
  model: User,
  url: "http://localhost:3000/api/users?limit=20",
  // parse: function (data) {
  // 	data.forEach(el => {
  // 		this.add(new User(el));
  // 	});
  // }
});

const Friends = Backbone.Collection.extend({});

export { User, Friends, Users, UserGames };
