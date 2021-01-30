import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const ChannelUsers = Backbone.Collection.extend({
  url() {
    return `http://` + window.location.hostname + `:3000/api/channels/${this.channel_id}/channel_users/`;
  },
  initialize(props) {
    this.channel_id = props.channel_id;
  },
  addAs(type, username, date) {
    console.log("ADD", username, "TO", type, "WITH", date);
    console.log(this.models);

    const user = this.findWhere({ username: username });
    console.log("USER", user);

    // if (user.get("admin") == true && type != "admin") return null;
    if (user) {
      user.set(type, true);
      if (type == "banned" || type == "muted") {
        const dateType = type == "banned" ? "ban_date" : "mute_date";
        user.set(dateType, date);
      }
      console.log(user, "SET", type, "TO TRUE");
    }
    return user;
  },
  removeAs(type, userId) {
    console.log(`REMOVE ${userId} AS ${type}`);

    const user = this.findWhere({ user_id: parseInt(userId) });
    console.log("USER", user);

    user.set(type, false);
    if (type !== "admin") {
      const dateType = type == "banned" ? "ban_date" : "mute_date";
      user.set(dateType, null);
    }
    return user;
  },
  saveChanges() {
    this.models.forEach((channelUser) => {
      if (channelUser.hasChanged()) {
        console.log(channelUser, "has changed");
        channelUser.save({
          success: () => console.log("Successfully updated user"),
          error: () =>
            console.log("Error when saving " + channelUser.get("username")),
        });
      }
    });
    // Backbone.sync("PUT", this);
  },
});

export { ChannelUsers };
