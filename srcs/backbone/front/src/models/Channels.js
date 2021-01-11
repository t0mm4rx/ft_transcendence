/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";

const Channel = Backbone.Model.extend({});

const Chat = Backbone.Collection.extend({
  initialize() {
    this.fetch();
  },
  model: Channel,
  url: "http://localhost:3000/api/channels/",
});

const Message = Backbone.Model.extend({});

const ChannelMessages = Backbone.Collection.extend({
  initialize(props) {
    this.channel_id = props.channel_id;
  },
  model: Message,
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
});

export { Channel, Chat, ChannelMessages, Message };
