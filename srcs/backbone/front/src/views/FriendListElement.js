import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

export default Backbone.View.extend({
  className: "friend-item",
  render(user) {
    this.$el.html(
      `<img src="${user.avatar_url}" onclick="window.location.hash='user/${
        user.login
      }/'"/>
      				<b class="friend-name" onclick="window.location.hash='user/${
                user.login
              }/'">${user.username}</b>
      				<span class="friend-status${
                user.status == "online" ? " friend-status-online" : ""
              }">${
        user.status.charAt(0).toUpperCase() + user.status.slice(1)
      }</span>
      				<span class="button-icon message-button" id="message-${
                user.login
              }"><i class="far fa-comment"></i></span>
      				${
                user.status == "online"
                  ? `<span class="button-icon button-icon-accent game-button" id="game-${user.login}"><i class="fas fa-gamepad"></i></span>`
                  : ""
              }`
    );
    return this;
  },
});
