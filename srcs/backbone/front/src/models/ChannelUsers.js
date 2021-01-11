import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const ChannelUsers = Backbone.Collection.extend({
  idAttribute: "user_id",
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/channel_users/`;
  },
  loadWithId(channel_id) {
    this.channel_id = channel_id;
    this.fetch();
  },
  addAdmin(name) {
    console.log("ADD ADMIN: ", name);
    const user = this.findWhere({ username: name });
    user.set("admin", true);
    return user;
  },
  remove(type, userId) {
    const user = this.findWhere({ user_id: parseInt(userId) });
    user.set(type, false);
    return user;
  },
  banUser(id) {},
  muteUser(id, until) {},
});

export { ChannelUsers };
