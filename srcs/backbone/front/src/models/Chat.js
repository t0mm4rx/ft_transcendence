/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const Channel = Backbone.Model.extend({
  leave() {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/channels/${this.id}/channel_users/${window.currentUser.id}`,
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`Left channel`);
        this.trigger("leave");
      },
      error: () => {
        toasts.notifyError("Failed to leave channel");
      },
    });
  },
});

const Chat = Backbone.Collection.extend({
  url: "http://" + window.location.hostname + ":3000/api/channels/",
  initialize() {
    this.fetch();
    this.currentChat = null;
  },
  model: Channel,
  addChannel(name, password) {
    const existing = this.findWhere({ name: name });
    if (!!existing) {
      this.get(existing.id).trigger("changeTo");
      return;
    }
    $.ajax({
      url: this.url,
      type: "POST",
      data: `name=${name}&password=${password}`,
      success: (data) => {
        this.fetch({
          success: (d) => {
            toasts.notifySuccess("The channel has been created.");
            setTimeout(() => this.get(data.id).trigger("changeTo"), 300);
          },
        });
      },
      error: () => {
        toasts.notifyError("The channel couldn't be created.");
      },
    });
  },
  editChannel(data, id, success_message) {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/channels/${id}`,
      type: "PUT",
      data: data,
      success: () => {
        toasts.notifySuccess(`Password ${success_message}`);
        this.fetch({
          success: () => {
            setTimeout(() => this.get(id).trigger("changeTo"), 300);
          },
        });
      },
      error: () => {
        toasts.notifyError("Failed to change password");
      },
    });
  },
});

export { Chat };
