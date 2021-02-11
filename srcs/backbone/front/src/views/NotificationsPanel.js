/* Notification panel view. The panel template is the one controlling the panel,
the list is for refreshing only the part displaying the notifications and avoid a blinking panel. */
import Backbone from "backbone";
import template_frame from "../../templates/notification-panel.html";
import template_list from "../../templates/notification-list.html";
import { showModal } from "../utils/modal";
import { User } from "../models/User";
import _ from "underscore";
import $ from "jquery";

export default Backbone.View.extend({
  el: "#notifications-menu",
  initialize: function () {
    this.listenTo(window.currentUser, "change", this.renderList);
    this.listenTo(window.users, "add", this.renderList);
    this.listenTo(window.guilds, "add", this.renderList);
    this.notifs = [];
  },
  events: {
    "click #notification-panel-close": function () {
      $("#notification-panel").removeClass("notification-panel-open");
    },
    "click #notification-icon": function () {
      if (this.notifs.length > 0)
        $("#notification-panel").addClass("notification-panel-open");
    },
    "click .notification-delete": function (el) {
      const elId = el.currentTarget.getAttribute("notification-id");
      const type = elId.split("-")[0];
      const id = parseInt(elId.split("-")[1]);
      if (type === "friend") {
        window.users.models.find((a) => a.get("id") === 3).unfriend();
      }
      if (type === "war") {
        window.guilds.declineWar();
      } else if (type === "ladder") {
        window.currentUser.declineLadderGame(id);
      }
    },
    "click .notification-accept": function (el) {
      const elId = el.currentTarget.getAttribute("notification-id");
      const type = elId.split("-")[0];
      console.log("NOTIF TYPE = ", type);
      const id = parseInt(elId.split("-")[1]);
      console.log("NOTIF USER ID = ", id);
      const username = elId.split("-")[2];
      console.log("NOTIF USER NAME = ", username);
      if (type === "friend") {
        const target = new User({ id: id, username: username });
        target.acceptFriend();
      } else if (type === "game") {
        const target = new User({ id: id, username: username });
        target.acceptGame();
      } else if (type === "ladder") {
        window.currentUser.acceptLadderGame(id);
      } else if (type === "war") {
        const war = window.wars.where('id', window.currentUser.get('guild').war_invite_id);
        if (!war)
          return;
        console.log(war);
        showModal("War declaration", 
        `<div id="war-notification"><p>Prize: ${war.get('prize')}</p>
        <p>From ${new Date(war.get('start_date')).toLocaleDateString("en-FR")} to ${new Date(war.get('end_date')).toLocaleDateString("en-FR")}</p>
        <p>War time from ${new Date(war.get('wt_start')).toLocaleDateString("en-FR")} to ${new Date(war.get('wt_end')).toLocaleDateString("en-FR")}</p>
        <p>Max unanswered games: ${war.get('wt_max_unanswers')}</p></div>`
        , () => {
          window.guilds.acceptWar();
          return true;
        }, () => {
          return true;
        });
      }
    },
  },
  render: function () {
    this.$el.html(_.template(template_frame)({ model: this.model }));
    this.renderList();
  },
  renderList: function () {
    if (!window.currentUser || !window.currentUser.get("pending_requests")) return;
    this.notifs = [];
    window.currentUser.get("pending_requests").forEach((req) => {
      const user = window.users.where({ id: req.user_id });
      if (user.length) {
        this.notifs.push({
          title: `${user[0].get("username")} sent you a friend request`,
          type: "friend",
          id: user[0].get("id"),
          name: user[0].get("username"),
        });
      }
    });
    window.currentUser.get("game_pending_requests").forEach((req) => {
      const user = window.users.where({ id: req.user_id });
      if (user.length) {
        this.notifs.push({
          title: `${user[0].get("username")} sent you a game request`,
          type: "game",
          id: user[0].get("id"),
          name: user[0].get("username"),
        });
      }
    });
    window.currentUser.get("pending_games").forEach((req) => {
      let type = req.ladder ? "ladder" : "";
      if (req.game_type == "war") type = "war";
      else if (req.tournament_id) type = "tournament";
      const user = window.users.find(req.user_id);
      if (!!user) {
        this.notifs.push({
          title: `${user.get("username")} sent you a ${type} game request`,
          type: "ladder",
          id: req.id,
          name: user.get("username"),
        });
      }
    });
    if (
      window.currentUser.get("guild") &&
      window.currentUser.get("guild").war_invites
    ) {
      const guild_id = window.currentUser.get("guild").war_invites;
      const guild = window.guilds.where("id", guild_id);
      if (!!guild)
      this.notifs.push({
        title: `${guild.get("name")} declares war to your guild`,
        type: "war",
        id: 0,
      });
    }
    if (this.notifs.length <= 0) {
      $("#notification-panel").removeClass("notification-panel-open");
      $("#notification-badge").hide();
    } else {
      $("#notification-badge").show();
      $("#notification-badge").text(this.notifs.length);
    }
    $("#notification-list").html(
      _.template(template_list)({ notifs: this.notifs })
    );
  },
});
