import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import _ from "underscore";

const ChannelUser = Backbone.Model.extend({
  rollback(prev) {
    if (!prev) {
      const changed = this.changedAttributes();
      console.log("ROLLBACK:", this, changed);
      if (!changed) return;

      const keys = _.keys(changed);
      prev = _.pick(this.previousAttributes(), keys);
    }
    this.set(prev, { silent: true }); // "silent" is optional; prevents change event
    console.log("AFTER ROLLBACK:", this);
  },
});

const ChannelUsers = Backbone.Collection.extend({
  model: ChannelUser,
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/channel_users/`;
  },
  initialize(props) {
    this.channel_id = props.channel_id;
  },
  addAs(type, username, date) {
    console.log("ADD", username, "TO", type, "WITH", date);
    console.log(this.models);

    const user = this.findWhere({ username: username });

    if (user) {
      const params = {};
      params[type] = true;
      if (type == "banned" || type == "muted") {
        const dateType = type == "banned" ? "ban_date" : "mute_date";
        params[dateType] = date;
      }
      console.log(user, "SET", type, "TO TRUE");
      user.set(params);
    }
    return user;
  },
  removeAs(type, userId) {
    const user = this.findWhere({ user_id: parseInt(userId) });
    const params = {};
    params[type] = false;
    if (type == "banned" || type == "muted") {
      const dateType = type == "banned" ? "ban_date" : "mute_date";
      params[dateType] = null;
    }
    user.set(params);
    return user;
  },
  saveChanges() {
    console.log("SAVE CHANGES");

    this.each((channelUser) => {
      console.log("1", channelUser);

      if (channelUser.hasChanged()) {
        console.log("2", channelUser, channelUser.changedAttributes());

        const changed = channelUser.changedAttributes();
        const keys = _.keys(changed);
        const prev = _.pick(channelUser.previousAttributes(), keys);

        channelUser.save(channelUser.changedAttributes(), {
          patch: true,
          success: () => console.log("Successfully saved user"),
          error: (data, state) => {
            console.log("CHANGED ", changed, prev);

            channelUser.rollback(prev);
            toasts.notifyError(state.responseJSON.error);
          },
        });
      }
    });
  },
  rollbackChanges() {
    this.each((channelUser) => {
      channelUser.rollback();
    });
  },
});

export { ChannelUsers };
