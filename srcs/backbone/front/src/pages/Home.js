/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/home.html";
import { Livestream } from "../models/Livestream";
import GameListElement from "../views/GameListElement";
import FriendListElement from "../views/FriendListElement";

export default Backbone.View.extend({
  el: "#page",
  events: {
    "click .message-button": function (event) {
      $(document).trigger("chat", {
        chat: event.currentTarget.id.split("-")[1],
      });
    },
    "click .game-button": function (event) {
      const login = event.currentTarget.id.split("-")[1];
      window.users.find(a => a.get("login") === login).askGame();
    },
  },
  render: function () {
    this.$el.html(template);
    this.renderGameList();
    this.renderFriendsList();
    this.listenTo(window.currentUser, "change", this.renderFriendsList);
  },
  renderGameList: async function () {
    const games = $("#live-game-list");
    games.html("");
    const to_stream = await new Livestream().gamestostream();
    console.log("To stream : ", to_stream);

    if (to_stream !== null) {
      games.append(
        `<div class="game-item">
					<span><b>${to_stream.player.username}</b> vs. <b>${to_stream.opponent.username}</b></span>
					<span>${to_stream.game_type}</span>
					<a class="button-icon button-icon-accent" onclick="window.location.hash='livestream/${to_stream.id}/'"><i class="fas fa-tv"></i></a>
				</div>`
      );
    }
  },
  renderFriendsList: function () {
    if (!window.currentUser.get("friends")) return;
    const friends = $("#live-friends-list");
    friends.html("");
    // const friendsel = new FriendListElement();
    window.currentUser.get("friends").forEach((friend) => {
      const friendsel = new FriendListElement();
      friends.append(friendsel.render(friend).el);
    });
  },
});
