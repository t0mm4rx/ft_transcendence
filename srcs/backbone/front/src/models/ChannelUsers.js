import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import _ from "underscore";

const ChannelUsers = Backbone.Collection.extend({
  initialize(props) {
    this.channel_id = props.channel_id;
    this.url = `http://${window.location.hostname}:3000/api/channels/${this.channel_id}/channel_users/`;
  },
  addAs(type, username, date, onSuccess) {
    const user = this.findWhere({ username: username });
    if (!user) return null;
    console.log("ADD AS ", user, type);

    const params = {
      [type]: true,
    };
    if (type == "banned" || type == "muted") {
      const dateType = type == "banned" ? "ban_date" : "mute_date";
      params[dateType] = date;
    }
    user.save(params, {
      patch: true,
      success: onSuccess,
      error: (data, response) => {
        console.log("Failed", response);
        toasts.notifyError(response.responseJSON.user_id);
      },
    });

    return user;
  },
  removeAs(type, userId, onSuccess) {
    const user = this.findWhere({ user_id: parseInt(userId) });
    if (!user) return null;
    const params = {
      [type]: false,
    };
    if (type == "banned" || type == "muted") {
      const dateType = type == "banned" ? "ban_date" : "mute_date";
      params[dateType] = null;
    }
    user.save(params, {
      patch: true,
      success: onSuccess,
      error: (data, response) => {
        console.log("Failed", response);
        toasts.notifyError(response.responseJSON.user_id);
      },
    });
    return user;
  },
});

export { ChannelUsers };
