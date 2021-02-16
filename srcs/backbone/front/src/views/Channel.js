/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";
import { ChannelUsers } from "../models/ChannelUsers";
import EditChat from "./EditChat";
import { User } from "../models/User";

export default Backbone.View.extend({
  className: "chat-chat",
  template: _.template(`
  <div class="chat-header">
  <% if (model.escape('avatar')) { %>
  <img id="chat-avatar" src="<%= model.escape("avatar") %>" />
  <% } %>
  <span id="chat-title"><%= model.escape('name') %></span>
  <% if (model.escape('avatar')) { %>
  <div class="button-icon" id="start-game"><i class="fas fa-gamepad"></i></div>
  <div class="button-icon" id="block-user"><i class="fas fa-ban"></i></div>
  <% } else { if (model.get("admin") === true || model.get("owner") === true) { %>
    <div class="button-icon" id="edit-channel"><i class="fas fa-cog"></i></div>
   <% } %>
    <div class="button-icon" id="leave-channel"><i class="fas fa-sign-out-alt"></i></div>
   <% } %>
   </div>`),
  messageTemplate: _.template(`<div class="chat-message-container<%= (sentByMe) ? " chat-message-container-me" : "" %><%= sentByLast ? " chat-message-container-no-margin": "" %>" id="<%= model.username %>">
  <% if (!sentByLast)  { %>
  <div class="chat-message-infos">
  <a href="/#user/<%= model.login %>/" class="chat-message-username" id="<%= model.login %>"><%= model.username %></a><span><%= date %></span>
  </div>
  <% } %>
    <div class="chat-message"><%= model.body %></div>
  </div>`),
  initialize() {
    this.id = this.model.id;

    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.collection, "join", this.joinChannel);
    this.listenTo(this.collection, "newMessage", this.onNewMessage);
    this.listenTo(this.collection, "load", this.onLoadMessages);

    this.channelUsers = new ChannelUsers({
      channel_id: this.model.id,
    });

    this.lastUser = null;
  },
  events: {
    "click #edit-channel": "editChannel",
    "click #block-user": function ({ currentTarget }) {
      const login = $(currentTarget.parentNode).find("#chat-title").html();
      console.log(login);
      const user = new User({ id: login });
      user.fetch({
        success: () => {
          if (user.get("blocked") === true) {
            user.unblock();
          } else {
            user.block();
          }
        },
      });
    },
    "click #chat-title": function () {
      this.getUserProfile();
    },
    "click #chat-avatar": function () {
      this.getUserProfile();
    },
    "click #start-game": function () {
      // console.log("Model : ", this.model);
      if (this.model.get("direct") == true) {
        const channel_users = this.model.get("channel_users");
        var user;
        if (channel_users[0].user_id === window.currentUser.get("id"))
          user = new User({ id: channel_users[1].user_id });
        else user = new User({ id: channel_users[0].user_id });
        user.askGame(true);
      }
    },
  },
  render(adminPeak) {
    this.adminPeak = adminPeak;
    this.messagesLength = this.collection.length;
    // console.log("RENDER CHANNEL");
    this.renderHeader();
    let html = `<div id="chat-messages"></div>`;
    if (!adminPeak)
      html += `<div id="chat-input" id=${this.model.id}>
      <input type="text" class="chat-input" id=${this.model.id} placeholder="Send something"/>
    </div>`;
    this.$el.append(html);
    this.$(".chat-input").keyup((e) => this.onKeyUp(e));
    this.renderMessages();
    return this;
  },
  renderHeader() {
    this.$el.html(this.template({ model: this.model }));
    if (this.adminPeak) {
      this.$("#leave-channel").hide();
    } else {
      // _.extend(this.events, { "click #leave-channel": "leaveChannel" });
      this.$("#leave-channel").on("click", () => this.leaveChannel());
    }
  },
  renderMessages() {
    const messages = this.collection.models;
    const html = this.messagesToHTML(messages);
    this.$("#chat-messages").html(html);
    this.$("#chat-messages").scroll(() => this.onScroll());
    return this;
  },
  onLoadMessages(messages) {
    if (this.collection.length == this.messagesLength) return;
    const newMessages = this.collection.length - this.messagesLength;
    this.messagesLength = this.collection.length;
    // console.log("ON MORE MESSAGES", newMessages, messages, this.collection);
    const html = this.messagesToHTML(messages.models.slice(0, newMessages));
    this.$("#chat-messages").prepend(html);
    document.querySelector("#chat-messages").scrollTop = $(
      `#${this.firstUser}`
    ).offset().top;
  },
  onNewMessage(message) {
    // console.log("NEW MESSAGE", message);
    const username = message.username;
    this.$("#chat-messages").append(
      this.messageTemplate({
        model: message,
        date: this.formatedDate(message.date),
        sentByMe: username == window.currentUser.get("username"),
        sentByLast: this.lastUser === username,
      })
    );
    this.lastUser = username;
    document.querySelector("#chat-messages").scrollTop = document.querySelector(
      "#chat-messages"
    ).scrollHeight;
  },
  messagesToHTML(messages) {
    console.log("MSG -> HTML", messages.length);
    if (messages.length > 0) this.firstUser = messages[0].get("username");
    let html = "";
    messages.forEach((message) => {
      const username = message.get("username");
      html += this.messageTemplate({
        model: message.toJSON(),
        date: this.formatedDate(message.get("date")),
        sentByMe: username == window.currentUser.get("username"),
        sentByLast: this.lastUser == username,
      });

      this.lastUser = username;
    });
    return html;
  },
  editChannel() {
    this.editView = new EditChat({
      model: this.model,
      collection: this.channelUsers,
    });
    this.channelUsers.fetch({
      success: () => {
        console.log("Successfully fetched channel users");
        this.editView.render(this.model.get("owner"));
      },
      error: () => toasts.notifyError("Failed to get channel data."),
    });
  },
  leaveChannel() {
    if (confirm(`Are your sure you want to leave the channel?`)) {
      this.model.leave();
      this.collection.closeSocket();
      this.$el.html("");
    }
  },
  joinChannel() {
    showModal(
      `Join channel`,
      `<div id="form-channel">
        ${
          this.model.get("private")
            ? `<div class="input-wrapper">
                <input type="password" placeholder="Enter password" id="new-channel-password" />
              </div>`
            : ""
        }        
      </div>`,
      () => {
        const password = $("#new-channel-password").val();
        this.collection.load({ password: password, join: true });
        return true;
      },
      () => {
        this.model.trigger("leave");
      }
    );
  },
  readMessage() {
    const input = $(".chat-input").val();
    if (input == "") return;
    $(".chat-input").val("");
    this.collection.sendMessage(input);
  },
  onScroll() {
    if ($("#chat-messages").scrollTop() == 0) {
      console.log(
        "ON SCROLL ",
        $("#chat-messages").scrollTop(),
        document.querySelector("#chat-messages").scrollHeight
      );
      this.collection.loadMessages(this.adminPeak);
    }
  },
  onKeyUp(event) {
    if (event.keyCode == 13) {
      if (event.target.id == this.model.id) this.readMessage();
    }
  },
  getUserProfile() {
    const login = this.model.get("name");
    console.log(login);
    if (window.users.find((a) => a.get("login") === login)) {
      window.location.hash = `user/${login}/`;
    }
  },
  options: {
    // weekday: "long",
    // year: "numeric",
    month: "long",
    day: "numeric",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  },
  formatedDate(date) {
    return new Date(date.replace(/-/g, "/")).toLocaleString(
      "en-US",
      this.options
    );
  },
});
