import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { Channel } from "../models/Channel";
import ChannelView from "./Channel";

export default Backbone.View.extend({
  tagName: "span",
  className: "chat-channel",
  initialize() {
    this.listenTo(this.model, "changeTo", this.renderMessages);
    this.listenTo(this.model, "leave", this.leave);
    this.listenTo(this.model, "block", this.onBlock);
    // this.listenTo(this.model, "banned", this.leave);
  },
  events: {
    click: "renderMessages",
  },
  render() {
    this.$el.html(this.model.escape("name"));
    return this;
  },
  renderMessages(e, adminPeak) {
    console.log("RENDER MESS", adminPeak);
    this.adminPeak = !!adminPeak;

    $(`.channel-current`).removeClass("channel-current");
    this.$el.addClass("channel-current");
    if (!this.channelMessages) {
      this.channelMessages = new Channel({
        channel_id: this.model.id,
        adminPeak: !!adminPeak,
      });
      this.channelView = new ChannelView({
        model: this.model,
        collection: this.channelMessages,
      });
      this.listenTo(this.channelMessages, "open", this.onLoad);
      this.listenTo(this.channelMessages, "leave", this.leave);
    } else {
      this.onLoad();
    }
  },
  onLoad() {
    if (this.adminPeak) {
      $(".chat-chat").replaceWith(this.channelView.renderAdminPeak().el);
    } else {
      $(".chat-chat").replaceWith(this.channelView.render().el);
    }
    document.querySelector("#chat-messages").scrollTop = document.querySelector(
      "#chat-messages"
    ).scrollHeight;
  },
  leave() {
    this.channelMessages = null;
    this.channelView = null;
    $(`.channel-current`).removeClass("channel-current");
  },
  onBlock() {
    if (this.channelMessages) this.channelMessages.fetch();
  },
});
