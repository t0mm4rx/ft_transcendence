/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import { FtSocket, FtSocketCollection } from "../models/FtSocket";
import $ from "jquery";
import _ from "underscore";
import ChannelView from "./Channel";
import { ChannelMessages } from "../models/Channels";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.listenTo(this.model, "sync", this.renderChannelList);
    this.listenTo(this.model, "add", this.renderChannelList);
    $(document).on("chat", (_, { chat }) => {
      $("#chat-panel").addClass("chat-panel-open");
      this.newChannel(chat);
    });
  },

  el: "#chat-container",
  events: {
    "click #chat-panel-close": function () {
      $("#chat-panel").removeClass("chat-panel-open");
    },
    "click #chat-icon": function () {
      this.model.fetch();
      $("#chat-panel").addClass("chat-panel-open");
    },
    "click .chat-channel": function (e) {
      this.changeChannel(e.target.id);
    },
    "keyup #channel-input": "keyPressEventHandler",
    "focus #channel-input": "autocomplete",
    "blur #channel-input": "closeAutocomplete",
    "click .autocomplete-item": function (event) {
      this.newChannel(event.currentTarget.innerText, "");
    },
    "click #chat-title": function () {
      const login = this.currentChat.get("name");
      console.log(login);
      if (window.users.find((a) => a.get("login") === login)) {
        window.location.hash = `user/${login}/`;
      }
    },
    "click #chat-avatar": function () {
      const login = this.currentChat.get("name");
      console.log(login);
      if (window.users.find((a) => a.get("login") === login)) {
        window.location.hash = `user/${login}/`;
      }
    },
    "click .fa-search": function () {
      $("#channel-input").trigger("focus");
    },
    "click #new-channel-button": function () {
      showModal(
        "Create a new channel",
        $("#create-channel-form").html(),
        () => {
          const name = $("#new-channel-name").val();
          const password = $("#new-channel-password").val();
          if (!name.length) {
            toasts.notifyError("Channel name can't be empty!");
            return false;
          }
          this.newChannel(name, password);
          return true;
        },
        () => {}
      );
    },
  },
  render() {
    this.$el.html(template);
    this.renderChannelList();
  },
  renderChannelList() {
    const template = _.template($("#tpl-channel-list").html());
    let div = `<label class="chat-channel-label">Public</label>`;
    let channelList = ``;
    let current = "public";
    this.model.forEach((channel) => {
      if (channel.attributes.private && current === "public") {
        channelList += `<hr class="chat-channel-divider">`;
        current = "private";
      }
      if (channel.attributes.direct && current !== "direct") {
        channelList += `<hr class="chat-channel-divider">`;
        current = "direct";
      }
      channelList += `<span class="chat-channel${
        this.currentChat === channel ? " channel-current" : ""
      }" id="${channel.id}">${channel.attributes.name}</span>`;
    });
    $("#chat-channels").html(template({ channels: channelList }));
    $("#autocomplete-container").hide();
  },
  renderChannel() {
    const user = window.users.find(
      (a) => a.get("login") === this.currentChat.get("name")
    );
    const avatar = !!user ? user.get("avatar_url") : null;

    $("#chat-chat").html("");
    if (this.currentChat) {
      const template = _.template($("#tpl-chat-wrap").html());
      const chatJson = this.currentChat.toJSON();
      chatJson.avatar = !!avatar ? avatar : "";
      $("#chat-chat").append(template(chatJson));
    }
  },
  changeChannel(id) {
    const newChannel = this.model.get(id);
    if (newChannel === this.currentChat) return;
    if (this.currentChat) {
      $(`#${this.currentChat.id}.chat-channel`).removeClass("channel-current");
    }
    $(`#${id}.chat-channel`).addClass("channel-current");
    this.currentChat = this.model.get(id);
    this.renderChannel();
    this.currentMessages = new ChannelMessages({ channel_id: id });
    if (!this.channelView) {
      this.channelView = new ChannelView({ model: this.currentMessages });
    } else {
      this.channelView.changeChannel(id);
    }
  },

  keyPressEventHandler(event) {
    if (event.target.id == "channel-input") {
      if (event.keyCode === 27) {
        event.target.blur();
      } else {
        this.autocomplete();
      }
    }
  },

  newChannel(name, password) {
    const existing = this.model.find((a) => a.get("name") === name);
    if (existing) {
      this.changeChannel(existing.get("id"));
    } else {
      const channel = this.model.add({ name: name, password: password });
      channel.save(null, {
        success() {
          toasts.notifySuccess("The channel has been created.");
          this.model.fetch();
        },
        error(model, response) {
          toasts.notifyError("Channel could not be created.");
          console.log(model, response);
        },
      });
    }
  },
  autocomplete() {
    const query = $("#channel-input").val();
    let result = false;
    $("#autocomplete-container").html("");
    window.users.forEach((user) => {
      if (query.length === 0 || user.get("login").indexOf(query) !== -1) {
        $("#autocomplete-container").append(
          `<span class="autocomplete-item">${user.get("login")}</span>`
        );
        result = true;
      }
    });
    if (!result) {
      $("#autocomplete-container").append(
        `<div id="autocomplete-no-result">No result found</div>`
      );
    }
    $("#autocomplete-container").show();
    $("#input-container .fa-search").addClass("fa-times");
  },
  closeAutocomplete() {
    setTimeout(() => {
      $("#autocomplete-container").hide();
      $("#input-container .fa-times").addClass("fa-search");
    }, 100);
  },
});
