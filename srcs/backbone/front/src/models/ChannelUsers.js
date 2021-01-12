import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const ChannelUsers = Backbone.Collection.extend({
  loadWithId(channel_id, isPrivate) {
    this.private = isPrivate;
    this.channel_id = channel_id;
    this.url = `http://localhost:3000/api/channels/${this.channel_id}/channel_users/`;
    // this.fetch();
  },
  addAs(type, username, date) {
    console.log("ADD", username, "TO", type, "WITH", date);

    const user = this.findWhere({ username: username });
    if (user) {
      user.set(type, true);
      if (type !== "admin") {
        const dateType = type == "banned" ? "ban_date" : "mute_date";
        user.set(dateType, date);
      }
    }
    return user;
  },
  removeAs(type, userId) {
    const user = this.findWhere({ user_id: parseInt(userId) });
    user.set(type, false);
    if (type !== "admin") {
      const dateType = type == "banned" ? "ban_date" : "mute_date";
      user.set(dateType, null);
    }
    return user;
  },
  save() {
    this.models.forEach((channelUser) => {
      if (channelUser.hasChanged()) {
        console.log(channelUser);
        channelUser.save({
          success: () => console.log("successfully updated user"),
          error: () =>
            console.log("error when saving " + channelUser.get("username")),
        });
      }
    });
    // Backbone.sync("PUT", this);
  },
  editPassword(password, no_pass) {
    if (this.private === false && (password == "" || no_pass)) return true;
    const data = no_pass
      ? `remove_password=${true}`
      : `add_change_password=${password}`;
    let success_message = no_pass ? "removed" : "changed";
    if (this.private == false) success_message = "added";
    $.ajax({
      url: `http://localhost:3000/api/channels/${this.channel_id}`,
      type: "PUT",
      data: data,
      success: () => {
        toasts.notifySuccess(`Password ${success_message}`);
        window.chat.fetch();
      },
      error: () => {
        toasts.notifyError("Failed to change password");
      },
    });
  },
});

export { ChannelUsers };
