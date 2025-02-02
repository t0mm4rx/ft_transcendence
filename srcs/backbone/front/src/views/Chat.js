/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import $ from "jquery";
import _ from "underscore";
import ChannelListElement from "./ChannelListElement";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.$el.html(template);
    this.listenTo(this.collection, "sync", this.render);
    this.listenTo(this.collection, "change", this.render);
    this.listenTo(this.collection, "block", this.onBlock);
    $(document).on("chat", (_, { chat }) => {
      $("#chat-panel").addClass("chat-panel-open");

      window.chat.fetch({
        success: () =>
          setTimeout(() => this.collection ? this.collection.addChannel(chat, "") : null, 200),
      });
    });
  },
  el: "#chat-container",
  events: {
    "click #chat-panel-close": function () {
      $("#chat-panel").removeClass("chat-panel-open");
    },
    "click #chat-icon": function () {
      if (this.collection)
        this.collection.fetch();
      $("#chat-panel").addClass("chat-panel-open");
    },
    "keyup #channel-input": "onKeyUp",
    "focus #channel-input": "autocomplete",
    "blur #channel-input": "closeAutocomplete",
    "click #new-channel-button": "createChannel",
    "click .autocomplete-item": function (event) {
      this.collection.addChannel(event.target.innerText, "");
    },
    "click .fa-search": function () {
      $("#channel-input").trigger("focus");
    },
  },
  render() {
    this.channelViews = [];
    let current = "public"; // todo: enum
    this.$("#channels-list").html(
      `<div id="input-container">
        <div id="icon-container">
          <i class="fas fa-search"></i>
        </div>
        <input type="text" id="channel-input" placeholder="Find user" />
      </div>`
    );
    this.collection.each((channel) => {
      if (channel.get("private") && current == "public") {
        this.$("#channels-list").append(`<hr class="chat-channel-divider"/>`);
        current = "private";
      }
      if (channel.get("direct") && current != "direct") {
        this.$("#channels-list").append(`<hr class="chat-channel-divider"/>`);
        current = "direct";
      }
      let channelView = new ChannelListElement({
        model: channel,
        id: channel.id,
      });
      this.channelViews.push(channelView);
      this.$("#channels-list").append(channelView.render().el);
    });
    this.$("#channels-list").append(`<div id="autocomplete-container"></div>`);
    $("#autocomplete-container").hide();
  },
  onKeyUp(event) {
    if (event.target.id == "channel-input") {
      if (event.keyCode === 27) {
        event.target.blur();
      } else {
        this.autocomplete();
      }
    }
  },
  createChannel() {
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
        this.collection.addChannel(name, password);
        return true;
      },
      () => {}
    );
  },
  autocomplete() {
    if (window.users.length === 0) {
      window.users.fetch({ success: () => this.autocomplete() });
      return;
    }
    const query = $("#channel-input").val();
    let result = false;
    $("#autocomplete-container").html("");
    window.users.each((user) => {
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
  onBlock() {
    this.channelViews.forEach((channel) => {
      channel.remove();
      $(".chat-chat").html("");
    });
    this.render();
  },
});
