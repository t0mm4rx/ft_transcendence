/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import { FtSocket, FtSocketCollection } from "../models/FtSocket";
import $ from "jquery";
import _ from "underscore";
import { showModal } from "../utils/modal";
import { Channel } from "../models/Channel";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.listenTo(this.model, "sync", this.render);
    this.listenTo(this.model, "add", this.render);
  },
  el: "#chat-chat",
  events: {
    "keyup #chat-input": "keyPressEventHandler",
  },
  model: Channel,
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
      console.log(messageJson);

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
    this.model.sendMessage(input);
  },
});
