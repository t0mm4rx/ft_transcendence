/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import { FtSocket, FtSocketCollection } from "../models/FtSocket";
import $ from "jquery";

export default Backbone.View.extend({
  initialize: function () {
    this.currentMessages = window.currentMessages;
    this.listenTo(this.model, "add", this.renderChannels);
    this.listenTo(this.currentChat, "change", this.renderChat);
    this.listenTo(this.currentMessages, "change", this.renderMessages);
    this.model.on("sync", this.renderChannels, this);
    this.currentMessages.on("sync", () => this.renderMessages(), this);

    this.newSocket = (channel_id) => {
      const ftsocket = new FtSocket({
        id: channel_id,
        channel: "MessageChannel",
      });
      ftsocket.socket.onmessage = (event) => {
        const event_res = event.data;
        const msg = JSON.parse(event_res);
        // Ignores pings.
        if (msg.type === "ping") return;
        if (msg.message) {
          console.log(msg.message);
          this.currentMessages.add({
            username: msg.message.login,
            body: msg.message.message,
            date: msg.message.date,
          });
          this.renderMessages();
        }
      };
      return ftsocket;
    };
  },
  el: "#chat-container",
  events: {
    "click #chat-panel-close": function () {
      $("#chat-panel").removeClass("chat-panel-open");
    },
    "click #chat-icon": function () {
      $("#chat-panel").addClass("chat-panel-open");
    },
    "click .chat-channel": function (e) {
      this.currentChat = window.chat.get(e.target.id);
      this.currentMessages.channel_id = this.currentChannelId = e.target.id;
      this.ftsocket = this.newSocket(this.currentChannelId);
      this.currentMessages.fetch();
    },
    "keyup #chat-input": "keyPressEventHandler",
    "keyup #channel-input": "keyPressEventHandler",
  },
  render: function () {
    this.$el.html(template);
    this.renderChannels();
    this.renderMessages();
  },

  renderChannels: function () {
    $("#chat-channels").html(
      `<input type="text" id="channel-input" placeholder="Add channel" />`
    );
    this.model.forEach((channel) => {
      $("#chat-channels").append(
        `<span class="chat-channel${
          this.currentChat === channel ? " channel-current" : ""
        }" id="${channel.id}">${channel.attributes.name}</span>`
      );
    });
  },
  renderMessages: function () {
    $("#chat-chat").html("");
    if (this.currentChat && this.currentMessages) {
      $("#chat-chat").append(
        `<div class="chat-header">
					${
            !!this.currentChat.attributes.avatar
              ? `<img src=\"${this.currentChat.attributes.avatar}\" />`
              : ""
          }
					<span>${this.currentChat.attributes.name}</span>
				</div>
				<div id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Send something"/>
				</div>`
      );
      this.renderChat();
    }
  },
  renderChat: function () {
    $("#chat-messages").html();
    let lastUser = null;
    const messages = this.currentMessages.models;
    messages.forEach((message) => {
      let html = "";
      html += `<div class=\"chat-message-container ${
        message.attributes.username === window.currentUser.attributes.username
          ? "chat-message-container-me"
          : ""
      } ${
        lastUser === message.attributes.username
          ? "chat-message-container-no-margin"
          : ""
      }\">`;
      if (lastUser !== message.attributes.username)
        html += `<div class="chat-message-infos"><span>${message.attributes.username}</span><span>${message.attributes.date}</span></div>`;
      html += `<span class="chat-message">${message.attributes.body}</span>`;
      html += "</div>";
      lastUser = message.attributes.username;
      $("#chat-messages").append(html);
    });
    document.querySelector("#chat-messages").scrollTop = document.querySelector(
      "#chat-messages"
    ).scrollHeight;
  },
  keyPressEventHandler: function (event) {
    if (event.keyCode == 13) {
      if (event.target.id == "chat-input") this.newMessage();
      if (event.target.id == "channel-input") this.newChannel();
    }
  },
  newMessage() {
    const input = $("#chat-input").val();
    if (input == "") return;
    console.log("INPUT: ", input);
    console.log("current chat: ", this.currentMessages);
    $.ajax({
      url: `http://localhost:3000/api/channels/${this.currentChannelId}/messages/`,
      type: "POST",
      data: `body=${input}`,
    });
  },
  newChannel() {
    const input = $("#channel-input").val();
    if (input == "") return;
    $("#channel-input").val("");
    // console.log("INPUT: ", input);
    // console.log(window.chat);
    // const channel = window.chat.add({ name: input });
    // console.log("NEW CHANNEL", channel);

    // channel.save();
    // window.chat.fetch();

    const request = $.ajax({
      url: `http://localhost:3000/api/channels/`,
      type: "POST",
      data: `name=${input}`,
    });
    request.done(function (data) {
      window.chat.fetch();
    });
  },
});
