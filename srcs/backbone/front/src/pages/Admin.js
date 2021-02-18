/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/admin.html";
import { ChannelUsers } from "../models/ChannelUsers";
import EditChat from "../views/EditChat";
import EditGuild from "../views/EditGuild";
import toasts from "../utils/toasts";
// import { User } from "../models/User";
import { Guilds } from "../models/Guild";
import { showModal } from "../utils/modal";

const User = Backbone.Model.extend({
  urlRoot: `http://${window.location.hostname}:3000/api/users`,
});

const Users = Backbone.Collection.extend({
  model: User,
  url: `http://${window.location.hostname}:3000/api/users`,
  getAdmins() {
    this.fetch({
      data: { admin: true },
    });
  },
});

export default Backbone.View.extend({
  el: "#page",
  initialize() {
    this.listenTo(this.collection, "add", this.renderChannelsList);
    this.admins = new Users();
    this.admins.getAdmins();
    this.listenTo(this.admins, "sync", this.renderAdminsList);
    this.guilds = new Guilds();
    this.guilds.fetch();
    this.listenTo(this.guilds, "sync", this.renderGuildsList);
  },
  render: function () {
    this.$el.html(template);
    this.renderAdminsList();
    this.renderChannelsList();
    this.renderGuildsList();
  },
  events: {
    "click .edit-guild": "editGuild",
    "click .edit-channel": "editChannel",
    "click .show-channel": "showChannel",
    "click .delete-channel": "deleteChannel",
    "click .delete-admin": function (e) {
      const user = this.admins.get(parseInt(e.currentTarget.id));
      user.save(
        { admin: false },
        {
          success: () => {
            this.admins.remove(user);
            e.currentTarget.parentNode.remove();
          },
          error: (a, state) => {
            // console.log(a, b);

            if (state.status == 403)
              toasts.notifyError(
                "you don't have the rights to make this change"
              );
          },
        }
      );
    },
    "click #admin.button": function () {
      const login = $("#admin-login-input").val();
      const user = new User({ id: login });
      user.save(
        { admin: true },
        {
          patch: true,
          success: () => this.admins.add(user),
          error: (a, state) => {
            // console.log(a, b);
            if (state.status == 403)
              toasts.notifyError(
                "you don't have the rights to make this change"
              );
          },
        }
      );
    },
    "click #ban.button": "banUser",
    "click #create-tournament-button": "createTournament",
  },
  renderAdminsList() {
    const list = $(".listing#admins");
    list.html("");
    this.admins.each((user) => {
      let html = `<div class="listing">
      <div class="listing-item">
        <span>${user.get("username")}</span>`;
      if (!user.get("owner"))
        html += `<div class="button-icon delete-admin" id="${user.id}">
        <i class="fas fa-minus-circle"></i>
      </div>`;
      list.append(html + "</div></div>");
    });
  },
  renderChannelsList: function () {
    const list = $(".listing#channels");
    list.html("");

    this.collection.where({ direct: false }).forEach((channel) => {
      list.append(
        `<div class="listing-item" id="${channel.id}">
					<span>${channel.escape("name")}</span>
					<div class="button-icon edit-channel"><i class="fas fa-cog"></i></div>
					<div class="button-icon show-channel"><i class="fas fa-eye"></i></div>
					<div class="button-icon delete-channel"><i class="fas fa-minus-circle"></i></div>
				</div>`
      );
    });
  },
  renderGuildsList: function () {
    const list = $(".listing#guilds");
    list.html("");
    this.guilds.each((guild) => {
      list.append(
        `<div class="listing-item" id="${guild.id}">
					<span>${guild.escape("anagram")}</span>
					<div class="button-icon edit-guild"><i class="fas fa-cog"></i></div>
				</div>`
      );
    });
  },
  editGuild(e) {
    const id = this.getId(e);
    const guild = this.guilds.get(id);
    console.log("G USERS", guild.get("users"));
    const editGuild = new EditGuild({ model: guild });
    // editGuild.render();
  },
  editChannel(e) {
    const id = this.getId(e);
    const model = this.collection.get(id);
    const channelUsers = new ChannelUsers({
      channel_id: id,
    });
    const editView = new EditChat({
      model: model,
      collection: channelUsers,
    });
    channelUsers.fetch({
      success: () => {
        editView.render(true, true);
      },
      error: () => toasts.notifyError("Failed to get channel data."),
    });
  },
  showChannel(e) {
    const id = this.getId(e);
    $("#chat-panel").addClass("chat-panel-open");
    $(`span.chat-channel#${id}`).trigger("click", true);
  },
  deleteChannel(e) {
    const id = this.getId(e);
    const model = this.collection.get(id);
    model.destroy({
      success: () => {
        toasts.notifySuccess("Channel deleted.");
        e.currentTarget.parentNode.remove();
      },
      error: () => toasts.notifyError("Failed to delete channel."),
    });
  },
  getId(e) {
    return e.currentTarget.parentNode.id;
  },
  banUser() {
    const login = $("#ban-login-input").val();
    const time = $("#ban-time-input").val();
    console.log("BAN", login, time);
    const user = window.users.findWhere({ login: login });
    console.log("USER ", user);
    if (!user) toasts.notifyError("No such user.");
    else user.banUntil(time);
  },
  createTournament() {
    const name = $("#tournament-name-input").val();
    const regStart = $("#registration-start-input").val();
    const start = $("#tournament-start-input").val();
    const title = $("#tournament-title-input").val();

    const timeZone = -(new Date().getTimezoneOffset() / 60);
    console.log("OFFSET", timeZone);

    if (name == "" || regStart == "" || start == "") {
      toasts.notifyError("Inputs can't be left blank");
      return;
    }
    $.ajax({
      url: `http://${window.location.hostname}:3000/api/tournaments`,
      type: "POST",
      data: {
        name: name,
        registration_start: regStart,
        start_date: start,
        title: title,
        timeZone: timeZone,
      },
      success: () => {
        toasts.notifySuccess(`The tournament has been created`);
        $("#tournament-name-input").val("");
        $("#registration-start-input").val("");
        $("#tournament-start-input").val("");
        $("#tournament-title-input").val("");
      },
      error: (state, date) => {
        if (state.responseJSON.start_date)
          toasts.notifyError(state.responseJSON.start_date);
        else if (state.responseJSON.registration_start)
          toasts.notifyError(state.responseJSON.registration_start);
      },
    });
  },
});
