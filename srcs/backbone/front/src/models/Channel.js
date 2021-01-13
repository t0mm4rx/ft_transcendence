/* A channel object contains the messages of a group of users.
Chat is the collection of all the channels of the user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import { showModal } from "../utils/modal";
import { FtSocket, FtSocketCollection } from "./FtSocket";
import _ from "underscore";

const Message = Backbone.Model.extend({});

const Channel = Backbone.Collection.extend({
  comparator: "date",
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
  model: Message,
  changeChannel(id) {
    this.channel_id = id;
    this.load();
    this.fetchBlockedUsers();
  },
  load(auth) {
    this.fetch({
      data: auth,
      success: () => {
        console.log("FETCHED MESSAGES FOR ", this.channel_id);
        this.socket(this.channel_id);
        this.trigger("changeChannel");
      },
      error: (data, state) => {
        const tplData = {
          password: state.responseText == "password",
        };
        if (state.status == 401) {
          showModal(
            `Join channel`,
            _.template($("#tpl-join-channel-form").html())(tplData),
            () => {
              const password = $("#new-channel-password").val();
              this.load({ password: password, join: true });
              return true;
            },
            () => {
              $("#chat-chat").html("");
            }
          );
        } else {
          toasts.notifyError(state.responseJSON.error);
          $("#chat-chat").html("");
        }
      },
    });
  },
  loadMessages() {
    // const offset = this.length();
    // console.log("LOAD MSG", this.length);

    this.fetch({
      data: { offset: this.length },
      remove: false,
      success: (data) => {
        console.log("Successfully fetched more messages");
        this.trigger("loadMessages", data);
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
      }
    };
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
