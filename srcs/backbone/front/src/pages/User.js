/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/user.html";
import { User, UserGames } from "../models/User";
import _ from "underscore";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";
import { loadUsers } from "../utils/globals";
import GameListElement from "../views/GameListElement";
import FriendListElement from "../views/FriendListElement";
import Compressor from "compressorjs";

export default Backbone.View.extend({
  el: "#page",
  events: {
    "click #user-friend-badge": function () {
      showModal(
        `Are your sure you want to unfriend ${this.model.get("username")} ?`,
        "",
        () => {
          this.model.unfriend();
          return true;
        },
        () => {}
      );
    },
    "click #user-add-friend": function () {
      this.model.askFriend();
    },
    "click #game-request-button": function () {
      this.model.askGame();
    },
    "click .message-button": function (event) {
      $(document).trigger("chat", {
        chat: event.currentTarget.id.split("-")[1],
      });
    },
    "click #block-button": function (e) {
      this.model.block();
    },
    "click #unblock-button": function (e) {
      this.model.unblock();
    },
    "click #edit-username": function () {
      showModal(
        `Edit your display name`,
        `<div id="user-modal-edit"><div class="input-wrapper">
				<span>Display name</span>
				<input type="text" placeholder="AwesomeBob" id="display-name-input" value="${this.model.get(
          "username"
        )}" />
			</div></div>`,
        () => {
          const value = $("#display-name-input")
            .val()
            .replace(/[&<>"'\/]/g, "");
          if (value.length === 0) {
            toasts.notifyError("The display name cannot be empty.");
            return false;
          }
          if (value === this.model.get("username")) {
            return true;
          }
          window.currentUser.save("username", value);
          this.model.set("username", value);
          return true;
        },
        () => {}
      );
    },
    "click .avatar-current-user": function () {
      $("#avatar-file").trigger("click");
    },
    "change #avatar-file": "updateProfilePicture",
    "click .game-button": function (event) {
      const login = event.currentTarget.id.split("-")[1];
      window.users.models.find((a) => a.get("login") === login).askGame();
    },
    "click #user-add-guild": function () {
      this.model.askGuild();
    },
  },
  initialize: function (options) {
    this.listenTo(window.currentUser, "change", this.render);
    this.listenTo(window.users, "add", this.fetchUser);
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "sync", this.render);
    this.games = new UserGames({ id: this.model.id });
    this.listenTo(this.games, "sync", this.renderHistoryList);
    // this.fetchUser();
    loadUsers();
  },
  render: function () {
    console.log(this.model);
    this.$el.html(_.template(template)({ data: this.model.toJSON() }));
    this.renderFriendsList();
    this.games.fetch();
  },
  renderFriendsList: function () {
    if (!this.model.get("friends")) return;
    const friends = this.$("#friends-panel-content");
    friends.html("");
    this.model.get("friends").forEach((friend) => {
      const friendsel = new FriendListElement();
      friends.append(friendsel.render(friend).el);
    });
  },
  renderHistoryList() {
    this.$("#history-panel-content").html("");
    this.games.each((game) => {
      let gameview = new GameListElement({ model: game });
      this.$("#history-panel-content").append(
        gameview.render(this.model.id).el
      );
    });
  },
  updateProfilePicture() {
    if (!document.querySelector("#avatar-file").files.length) return;
    const file = document.querySelector("#avatar-file").files[0];
    if (!file) return;
    var login = this.model.get("login");

    new Compressor(file, {
      minWidth: 150,
      minHeight: 150,
      maxWidth: 240,
      maxHeight: 240,

      // The compression process is asynchronous,
      // which means you have to access the `result` in the `success` hook function.
      success(result) {
        const formData = new FormData();

        // The third parameter is required for server
        formData.append("file", result, result.name);

        fetch("/upload", {
          method: "post",
          headers: { "X-Login": login },
          body: formData,
        })
          .then((res) => res.json())
          .then((result) => {
            window.currentUser.save(
              "avatar_url",
              `http://${window.location.hostname}:8080/${result.filepath}`
            );
            this.model.trigger("change");
          })
          .catch((err) => {
            console.log(err);
          });
      },
      error(err) {
        console.log(err.message);
      },
    });
  },
});
