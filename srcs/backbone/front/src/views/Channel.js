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
    this.listenTo(this.model, "changeChannel", this.render);
    this.listenTo(this.model, "newMessage", this.onNewMessage);
    this.listenTo(this.model, "loadMessages", this.onLoadMessages);
    document.addEventListener("scroll", () => this.onScroll(), true);
    this.template = _.template($("#tpl-chat-message").html());
    this.messagesLength = 0;
  },
  el: "#chat-chat",
  events: {
    "keyup #chat-input": "keyPressEventHandler",
  },
  model: Channel,
  render() {
    this.messagesLength = this.model.length;
    this.lastUser = null;
    const messages = this.model.models;
    const html = this.messagesToHTML(messages);
    $("#chat-messages").html(html);
    this.scrollDown();
    return this;
  },
  onLoadMessages(messages) {
    if (this.model.length == this.messagesLength) return;
    const newMessages = this.model.length - this.messagesLength;
    this.messagesLength = this.model.length;
    console.log("ON MORE MESSAGES", newMessages, messages, this.model);
    const html = this.messagesToHTML(messages.models.slice(0, newMessages));
    $("#chat-messages").prepend(html);
    document.querySelector("#chat-messages").scrollTop = $(
      `#${this.firstUser}`
    ).offset().top;
  },
  messagesToHTML(messages) {
    console.log("MSG -> HTML", messages.length);
    if (messages.length > 0) this.firstUser = messages[0].get("username");
    let html = "";
    messages.forEach((message) => {
      const messageJson = message.toJSON();
      const username = message.get("username");
      messageJson.sentByMe =
        username == window.currentUser.attributes.username
          ? " chat-message-container-me"
          : "";
      messageJson.sentByLast =
        this.lastUser === username ? " chat-message-container-no-margin" : "";
      this.lastUser = username;
      html += this.template(messageJson);
    });
    return html;
  },
  onNewMessage(message) {
    console.log("ON ADD", message);
    const username = message.username;
    message.sentByMe =
      username == window.currentUser.attributes.username
        ? " chat-message-container-me"
        : "";
    message.sentByLast =
      this.lastUser == username ? " chat-message-container-no-margin" : "";
    console.log("ON ADD", message, username, this.lastUser);
    this.lastUser = username;
    $("#chat-messages").append(this.template(message));
    this.scrollDown();
  },
  keyPressEventHandler(event) {
    if (event.keyCode == 13) {
      if (event.target.id == "chat-input") this.readMessage();
    }
  },
  readMessage() {
    const input = $("#chat-input").val();
    if (input == "") return;
    $("#chat-input").val("");
    this.model.sendMessage(input);
  },
  onScroll() {
    if ($("#chat-messages").scrollTop() == 0) {
      console.log(
        "ON SCROLL ",
        $("#chat-messages").scrollTop(),
        document.querySelector("#chat-messages").scrollHeight
      );
      this.model.loadMessages();
    }
  },
  scrollDown() {
    document.querySelector("#chat-messages").scrollTop = document.querySelector(
      "#chat-messages"
    ).scrollHeight;
  },
});
