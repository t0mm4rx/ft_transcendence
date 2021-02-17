/* Notification panel view. The panel template is the one controlling the panel,
the list is for refreshing only the part displaying the notifications and avoid a blinking panel. */
import Backbone from "backbone";
import template_frame from "../../templates/notification-panel.html";
import template_list from "../../templates/notification-list.html";
import { showModal } from "../utils/modal";
import { User } from "../models/User";
import _ from "underscore";
import $ from "jquery";
import toasts from "../utils/toasts";
import { Game } from "../models/Game";

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
      // const index = el.currentTarget.getAttribute("index");
      const type = elId.split("-")[0];
      const id = parseInt(elId.split("-")[1]);
      if (type === "friend") {
        window.users.models.find((a) => a.get("id") === 3).unfriend();
      } else if (type === "war") {
        window.guilds.declineWar();
      } else if (type === "guild_invite") {
        window.currentUser.declineGuildInvite();
      } else {
        const game = new Game({ id: id });
        game.destroy({
          success: (data) => {
            console.log("DENIED GAME");
            toasts.notifySuccess("Game declined");
            // this.removeNofif(parseInt(index));
          },
          error: (data) => {
            console.log("ERROR", data);
            toasts.notifyError(data.responseJSON.error);
          },
        });
      }
      el.currentTarget.parentNode.parentNode.remove();
      this.removeNofif();
    },
    "click .notification-accept": function (el) {
      const elId = el.currentTarget.getAttribute("notification-id");
      // const index = el.currentTarget.getAttribute("index");
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
      } else if (type === "war") {
        const war = window.wars.where(
          "id",
          window.currentUser.get("guild").war_invite_id
        );
        if (!war) return;
        console.log("War = ", war);
        showModal(
          "War declaration",
          `<div id="war-notification"><p>Prize: ${war.get("prize")}</p>
        <p>From ${new Date(war.get("start_date")).toLocaleString(
          "en-FR"
        )} to ${new Date(war.get("end_date")).toLocaleString("en-FR")}</p>
        <p>War time from ${new Date(war.get("wt_start")).toLocaleString(
          "en-FR"
        )} to ${new Date(war.get("wt_end")).toLocaleString("en-FR")}</p>
        <p>Max unanswered games: ${war.get("wt_max_unanswers")}</p>
		<p>All games count for the war: ${
      war.get("add_count_all") ? "yes" : "no"
    }</p>
	<p>You'll have ${war.get('wt_time_to_answer')} days to answer game requests.</p></div>`,
          () => {
            window.guilds.acceptWar();
            return true;
          },
          () => {
            return true;
          }
        );
      } else if (type === "war_game") {
        window.currentUser.acceptWarGame();
      } else if (type === "guild_invite") {
        window.currentUser.acceptGuildInvite();
      } else {
        const game = new Game({ id: id });
        game.open();
        // this.removeNofif(parseInt(index));
      }
      el.currentTarget.parentNode.parentNode.remove();
      this.removeNofif();
    },
  },
  render: function () {
    this.$el.html(_.template(template_frame)({ model: this.model }));
    this.renderList();
  },
  renderList: async function () {
    if (!window.currentUser || !window.currentUser.get("pending_requests"))
      return;
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
      if (req.game_type == "war") type = "war_game";
      else if (req.tournament_id) type = "tournament";
      const user = window.users.find(req.user_id);
      if (!!user) {
        let title = `${user.get("username")} sent you a ${type} game request`;
        if (type == "tournament") {
          title = `You have an upcoming tournament game. Declining or no-show leads to elimination.`;
        }
        this.notifs.push({
          title: title,
          type: type,
          id: req.id,
          name: user.get("username"),
        });
      }
    });
    if (window.currentUser.get("guild")) {
      if (window.currentUser.get("guild").war_invites) {
        const guild_id = window.currentUser.get("guild").war_invites;
        const guild = window.guilds.where("id", guild_id);
        if (!!guild)
          this.notifs.push({
            title: `${guild.get("name")} declares war to your guild`,
            type: "war",
            id: 0,
          });
      }
      if (window.currentUser.get("guild").wt_game_invite) {
        var prop = window.users.where({
          id: window.currentUser.get("guild").wt_game_invite,
        })[0];
        var self = this;
        if (prop) {
          await prop.fetch({
            success: () => {
              console.log(
                "Prop : ",
                `${prop.get("username")} from the ${
                  prop.get("guild").name
                } guild ask for a game.`
              );
              self.notifs.push({
                title: `${prop.get("username")} from the ${
                  prop.get("guild").name
                } guild ask for a game.`,
                type: "war_game",
                id: 0,
              });
            },
          });
        }
      }
    }

    if (window.currentUser.get("guild_invites") !== 0) {
      const user = window.users.models.find(
        (a) => a.get("id") === window.currentUser.get("guild_invites")
      );
      this.notifs.push({
        title: `${user.get("username")} wants to invite you in his/her guild.`,
        type: "guild_invite",
        id: 0,
      });
    }
    this.notifs.length_ = this.notifs.length;
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
  removeNofif() {
    // this.notifs.splice(index, 1);
    // $("#notification-panel").removeClass("notification-panel-open");
    this.notifs.length_ = this.notifs.length_ - 1;
    if (this.notifs.length_ <= 0) {
      $("#notification-badge").hide();
      $("#notification-panel").removeClass("notification-panel-open");
    } else {
      $("#notification-badge").text(this.notifs.length_);
    }
  },
});
