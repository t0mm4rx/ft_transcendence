/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import { FtSocket, FtSocketCollection } from "./FtSocket";
import _ from "underscore";

const Channel = Backbone.Collection.extend({
  comparator: "date",
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
  initialize(props) {
    this.channel_id = props.channel_id;
    this.load();
  },
  load(auth) {
    this.fetch({
      data: auth,
      success: () => {
        console.log("FETCHED MESSAGES FOR ", this.channel_id);
        this.socket(this.channel_id);
        this.fetchBlockedUsers();
        this.trigger("open");
      },
      error: (data, state) => {
        if (state.status == 401) {
          this.trigger("join");
        } else {
          toasts.notifyError(state.responseJSON.error);
          this.trigger("leave");
          $("#chat-chat").html("");
        }
      },
    });
  },
  loadMessages() {
    this.fetch({
      data: { offset: this.length },
      remove: false,
      success: (data) => {
        console.log("Successfully fetched more messages");
        this.trigger("load", data);
      },
      error: (data, state) => {
        console.log(state.responseJSON);
      },
    });
  },
  sendMessage(body) {
    $.ajax({
      url: `http://localhost:3000/api/channels/${this.channel_id}/messages`,
      type: "POST",
      data: `body=${body}`,
      success: () => {},
      error: (state) => {
        toasts.notifyError(state.responseJSON.error);
      },
    });
  },
  socket() {
    if (this.ftsocket) {
      this.ftsocket.closeConnection();
    }
    this.ftsocket = new FtSocket({
      id: this.channel_id,
      channel: "MessageChannel",
    });
    this.ftsocket.socket.onmessage = (event) => {
      const event_res = event.data;
      const msg = JSON.parse(event_res);
      // Ignores pings.
      if (msg.type === "ping") return;
      if (msg.message) {
        if (
          this.blockedUsers &&
          this.blockedUsers.includes(msg.message.user_id)
        ) {
          return;
        }
        this.trigger("newMessage", msg.message);
        this.add(msg.message);
      }
    };
  },
  closeSocket() {
    if (this.ftsocket) {
      this.ftsocket.closeConnection();
    }
  },
  fetchBlockedUsers() {
    $.ajax({
      url: `http://localhost:3000/api/blocked/`,
      type: "GET",
      success: (data) => {
        console.log("BLOCKED USERS: ", data);
        this.blockedUsers = data;
      },
      error: (state) => toasts.notifyError(state.responseJSON.error),
    });
  },
});

export { Channel };
