/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/admin.html";
import { ChannelUsers } from "../models/ChannelUsers";
import EditChat from "../views/EditChat";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  el: "#page",
  initialize() {
    this.listenTo(this.collection, "add", this.renderChannelsList);
  },
  render: function () {
    this.$el.html(template);
    this.renderChannelsList();
  },
  events: {
    "click .edit-channel": "editChannel",
    "click .show-channel": "showChannel",
    "click .delete-channel": "deleteChannel",
    "click #ban-button": "banUser",
  },
  renderChannelsList: function () {
    const list = $("#channels-listing");
    list.html("");

    this.collection.where({ direct: false }).forEach((channel) => {
      list.append(
        `<div class="channel-item" id="${channel.id}">
					<span>${channel.escape("name")}</span>
					<div class="button-icon edit-channel"><i class="fas fa-cog"></i></div>
					<div class="button-icon show-channel"><i class="fas fa-eye"></i></div>
					<div class="button-icon delete-channel"><i class="fas fa-minus-circle"></i></div>
				</div>`
      );
    });
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
    $(`span.chat-channel#${id}`).trigger("click");
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

    user.banUntil(time);
  },
});
