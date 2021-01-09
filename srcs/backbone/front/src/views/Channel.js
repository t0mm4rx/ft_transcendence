/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import { FtSocket, FtSocketCollection } from "../models/FtSocket";
import $ from "jquery";
import _ from "underscore";
import { showModal } from "../utils/modal";
import { ChannelMessages } from "../models/Channels";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.listenTo(this.model, "sync", this.render);
    this.listenTo(this.model, "add", this.render);
    this.listenOnChannel();
  },
  changeChannel(id) {
    this.model.channel_id = id;
    this.listenOnChannel();
  },
  listenOnChannel(password) {
    this.model.fetch({
      data: { password: password },
      success: () => {
        this.newSocket(this.model.channel_id);
        // return true;
      },
      error: () => {
        showModal(
          `Join channel`,
          _.template($("#tpl-channel-form").html())({
            name: "",
            password: "Enter password",
            checkbox: false,
          }),
          () => {
            const password = $("#new-channel-password").val();
            this.listenOnChannel(password);
            // if (!password && !this.listenOnChannel(password))
            //   toasts.notifyError("Bad password");
            return true;
          },
          () => {}
        );
        // return false;
      },
    });
  },
  el: "#chat-chat",
  events: {
    "keyup #chat-input": "keyPressEventHandler",
  },
  model: ChannelMessages,
  render() {
    const template = _.template($("#tpl-chat-message").html());
    $("#chat-messages").html("");
    let lastUser = null;
    const messages = this.model.models;
    messages.forEach((message) => {
      const messageJson = message.toJSON();
      const username = message.get("username");
      messageJson.sentByMe =
        username == window.currentUser.attributes.username
          ? "chat-message-container-me"
          : "";
      messageJson.sentByLast =
        lastUser === username ? "chat-message-container-no-margin" : "";
      lastUser = username;
      const html = template(messageJson);
      $("#chat-messages").append(html);
    });
    document.querySelector("#chat-messages").scrollTop = document.querySelector(
      "#chat-messages"
    ).scrollHeight;
    return this;
  },
  keyPressEventHandler(event) {
    if (event.keyCode == 13) {
      if (event.target.id == "chat-input") this.newMessage();
    }
  },
  newMessage() {
    const input = $("#chat-input").val();
    if (input == "") return;
    $("#chat-input").val("");
    $.ajax({
      url: `http://localhost:3000/api/channels/${this.model.channel_id}/messages/`,
      type: "POST",
      data: `body=${input}`,
    }).fail(() => toasts.notifyError("Message could not be sent"));
  },
  newSocket(channel_id) {
    this.ftsocket = new FtSocket({
      id: channel_id,
      channel: "MessageChannel",
    });
    this.ftsocket.socket.onmessage = (event) => {
      const event_res = event.data;
      const msg = JSON.parse(event_res);
      // Ignores pings.
      if (msg.type === "ping") return;
      if (msg.message) {
        console.log(msg.message);
        this.model.add({
          username: msg.message.login,
          body: msg.message.message,
          date: msg.message.date,
        });
      }
    };
  },
});
