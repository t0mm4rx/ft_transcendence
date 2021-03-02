import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import _ from "underscore";

const ChannelUser = Backbone.Model.extend({
  rollback(prev) {
    if (!prev) {
      const changed = this.changedAttributes();
      if (!changed) return;

      const keys = _.keys(changed);
      prev = _.pick(this.previousAttributes(), keys);
    }
    this.set(prev, { silent: true }); // "silent" is optional; prevents change event
  },
});

const ChannelUsers = Backbone.Collection.extend({
  model: ChannelUser,
  url() {
    return `http://` + window.location.hostname + `:3000/api/channels/${this.channel_id}/channel_users/`;
  },
  initialize(props) {
    this.channel_id = props.channel_id;
  },
  addAs(type, username, date) {
    const user = this.findWhere({ username: username });

    if (user) {
      const params = {};
      params[type] = true;
      if (type == "banned" || type == "muted") {
        const dateType = type == "banned" ? "ban_date" : "mute_date";
        params[dateType] = date;
      }
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

    this.each((channelUser) => {

      if (channelUser.hasChanged()) {

        const changed = channelUser.changedAttributes();
        const keys = _.keys(changed);
        const prev = _.pick(channelUser.previousAttributes(), keys);

        channelUser.save(channelUser.changedAttributes(), {
          patch: true,
          success: () => {},
          error: (data, state) => {
            console.log("Save Changes channel user : ", changed, prev);
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
