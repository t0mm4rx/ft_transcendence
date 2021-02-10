/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/user.html";
import { User, UserGames } from "../models/User";
import _ from "underscore";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";
import { loadUsers } from "../utils/globals";

export default Backbone.View.extend({
  el: "#page",
  events: {
    "click #user-friend-badge": function () {
      showModal(
        `Are your sure you want to unfriend ${this.user.get("username")} ?`,
        "",
        () => {
          this.user.unfriend();
          return true;
        },
        () => {}
      );
    },
    "click #user-add-friend": function () {
      this.user.askFriend();
    },
    "click #game-request-button": function () {
      this.user.askGame();
    },
    "click .message-button": function (event) {
      $(document).trigger("chat", {
        chat: event.currentTarget.id.split("-")[1],
      });
    },
    "click #block-button": function (e) {
      this.user.block();
    },
    "click #unblock-button": function (e) {
      this.user.unblock();
    },
    "click #edit-username": function () {
      showModal(
        `Edit your display name`,
        `<div id="user-modal-edit"><div class="input-wrapper">
				<span>Display name</span>
				<input type="text" placeholder="AwesomeBob" id="display-name-input" value="${this.user.get(
          "username"
        )}" />
			</div></div>`,
        () => {
          const value = $("#display-name-input").val();
          if (value.length === 0) {
            toasts.notifyError("The display name cannot be empty.");
            return false;
          }
          if (value === this.user.get("username")) {
            return true;
          }
          this.user.save("username", value);
          return true;
        },
        () => {}
      );
    },
    "click .avatar-current-user": function () {
      $("#avatar-file").trigger("click");
    },
    "change #avatar-file": function () {
      if (!document.querySelector("#avatar-file").files.length) return;
      const file = document.querySelector("#avatar-file").files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        const b64 = reader.result;
        document.querySelector(".avatar-current-user").src = b64;
        window.currentUser.save("avatar_url", b64);
      };
      reader.onerror = function (error) {
        console.log(error);
        toasts.notifyError("Unable to read the image you selected");
      };
    },
  },
  initialize: function (options) {
    // this.login = options.login;
    // this.user = new User();
    this.listenTo(window.currentUser, "change", this.fetchUser);
    this.listenTo(window.users, "add", this.fetchUser);
    this.listenTo(this.user, "change", this.render);
    this.listenTo(this.user, "sync", this.render);
    this.games = new UserGames({ id: this.user.id });
    this.listenTo(this.games, "sync", this.renderHistoryList);
    this.games.fetch();
    // this.fetchUser();
    loadUsers();
  },
  fetchUser: function () {
    this.preview = window.users.models.find(
      (a) => a.get("login") === this.login
    );
    if (this.preview) {
      this.user.set("id", this.preview.id);
      this.user.fetch();
      this.games = new UserGames({ id: this.preview.id });
      this.listenTo(this.games, "sync", this.renderHistoryList);
      this.games.fetch();
    }
  },
  render: function () {
    console.log(this.user.toJSON());
    this.$el.html(_.template(template)({ data: this.user.toJSON() }));
    this.renderFriendsList();
    this.renderHistoryList();
  },
  renderFriendsList: function () {
    if (!this.user.get("friends")) return;
    const friends = $("#friends-panel-content");
    friends.html("");
    this.user.get("friends").forEach((friend) => {
      friends.append(
        `<div class="friend-item">
					<img src="${friend.avatar_url}" onclick="window.location.hash='user/${
          friend.login
        }/'"/>
					<b class="friend-name" onclick="window.location.hash='user/${friend.login}/'">${
          friend.username
        }</b>
					<span class="friend-status${friend.online ? " friend-status-online" : ""}">${
          friend.online ? "Online" : "Offline"
        }</span>
					<span class="button-icon message-button" id="message-${
            friend.login
          }"><i class="far fa-comment"></i></span>
					${
            friend.online
              ? '<span class="button-icon button-icon-accent"><i class="fas fa-gamepad"></i></span>'
              : ""
          }
				</div>`
      );
    });
  },
  gameTemplate: _.template(`<div class="history-item">
    <span><b><%= game.get("player").username %></b> <span class="history-item-win"><%= game.escape("player_score") %></span> - <span><%= game.escape("opponent_score") %></span> <%= game.get("opponent").username %><span class="history-item-info"> - <%= game_type %> game</span></span>
    <span class="history-item-<%= result %>"><%= result %></span>
    </div>`),
  renderHistoryList() {
    let html = "";
    this.games.each((game) => {
      let game_type = "direct";
      if (game.get("ladder")) game_type = "ladder";
      else if (game.get("game_type") == "war") game_type = "war";
      else if (game.get("tournament_id")) game_type = "tournament";
      if (game.get("player") && game.get("opponent"))
        html += this.gameTemplate({
          game: game,
          result: game.get("winner_id") == this.user.id ? "win" : "loss",
          game_type: game_type,
        });
    });
    this.$("#history-panel-content").html(html);
  },
});