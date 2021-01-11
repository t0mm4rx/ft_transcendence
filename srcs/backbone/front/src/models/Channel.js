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
  url() {
    return `http://localhost:3000/api/channels/${this.channel_id}/messages`;
  },
  model: Message,
  changeChannel(id) {
    this.channel_id = id;
    this.load();
  },
  load(auth) {
    this.fetch({
      data: auth,
      success: () => {
        console.log("FETCHED MESSAGES FOR ", this.channel_id);

        this.socket(this.channel_id);
      },
      error: (data, state) => {
        // if (!data.password) toasts.notifyError("Bad password");
        console.log("ERROR: ", data, state);

        if (state.status == 401) {
          showModal(
            `Join channel`,
            _.template($("#tpl-join-channel-form").html())({
              password: state.responseText == "join",
            }),
            // $("#channel-password-form").html(),
            () => {
              const password = $("#new-channel-password").val();
              this.load({ password: password, join: true });
              return true;
            },
            () => {}
          );
        } else {
        }
      },
    });
  },
  sendMessage(body) {
    $.ajax({
      url: `http://localhost:3000/api/channels/${this.channel_id}/messages`,
      type: "POST",
      data: `body=${body}`,
      success: () => {},
      error: () => toasts.notifyError("Message could not be sent"),
    });
  },
  socket() {
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
        console.log(msg.message);
        this.add({
          username: msg.message.login,
          body: msg.message.message,
          date: msg.message.date,
        });
      }
    };
  },
});

export { Channel };
