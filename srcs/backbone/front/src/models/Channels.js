/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";

const Channel = Backbone.Model.extend({
  initialize: function () {
    this.channel_id = 1;
  },
  url: function () {
    // return `http://localhost:3000/api/channels/2/messages`;
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
});

const Chat = Backbone.Collection.extend({
  model: Channel,
  url: "http://localhost:3000/api/channels/",
});

const Message = Backbone.Model.extend({});

const ChannelMessages = Backbone.Collection.extend({
  initialize: function () {
    this.channel_id = 1;
  },
  model: Message,
  url: function () {
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
});

export { Channel, Chat, ChannelMessages, Message };
