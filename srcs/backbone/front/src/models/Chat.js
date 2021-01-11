/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const Channel = Backbone.Model.extend({
  edit(data, id, success_message) {
    $.ajax({
      url: this.url,
      type: "PUT",
      data: data,
      success: () => {
        toasts.notifySuccess(`Password ${success_message}`);
        this.fetch();
      },
      error: () => {
        toasts.notifyError("Failed to change password");
      },
    });
  },
});

const Chat = Backbone.Collection.extend({
  url: "http://localhost:3000/api/channels/",
  model: Channel,
  initialize() {
    this.fetch();
    this.currentChat = null;
  },
  addChannel(name, password, onSuccess) {
    const existing = this.findWhere({ name: name });
    if (existing) return resolve(existing.id);
    $.ajax({
      url: this.url,
      type: "POST",
      data: `name=${name}&password=${password}`,
      success: (data) => {
        this.fetch();
        setTimeout(() => {
          toasts.notifySuccess("The channel has been created.");
          onSuccess(data.id);
        }, 200);
      },
      error: () => {
        toasts.notifyFailure("The channel couldn't be created.");
      },
    });
  },

  editChannel(data, id, success_message) {
    $.ajax({
      url: `http://localhost:3000/api/channels/${id}`,
      type: "PUT",
      data: data,
      success: () => {
        toasts.notifySuccess(`Password ${success_message}`);
        this.fetch();
      },
      error: () => {
        toasts.notifyError("Failed to change password");
      },
    });
  },

  leaveChannel(id) {
    $.ajax({
      url: `http://localhost:3000//api/channels/${id}/channel_users/${window.currentUser.id}`,
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`Left channel`);
        // this.model.fetch();
      },
      error: () => {
        toasts.notifyError("Failed to leave channel");
      },
    });
  },
});

export { Chat };
