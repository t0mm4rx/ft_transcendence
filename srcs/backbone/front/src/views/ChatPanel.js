/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from "backbone";
import template from "../../templates/chat.html";
import { FtSocket, FtSocketCollection } from "../models/FtSocket";
import {showModal} from '../utils/modal';
import toasts from '../utils/toasts';
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
	$(document).on('chat', (_, {chat}) => {
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
      $("#chat-panel").addClass("chat-panel-open");
    },
    "click .chat-channel": function (el) {
      this.selectChannel(el.currentTarget.innerText);
    },
    "keyup #chat-input": "keyPressEventHandler",
	"keyup #channel-input": "keyPressEventHandler",
	"focus #channel-input": function () {
		this.autocomplete();
	},
	"blur #channel-input": function () {
		this.closeAutocomplete();
	},
	"click .autocomplete-item": function (event) {
		this.newChannel(event.currentTarget.innerText);
	},
	"click #chat-title": function () {
		const login = this.currentChat.get("name");
		console.log(login);
		if (window.users.find(a => a.get("login") === login)) {
			window.location.hash = `user/${login}/`;
		}
	},
	"click #chat-avatar": function () {
		const login = this.currentChat.get("name");
		console.log(login);
		if (window.users.find(a => a.get("login") === login)) {
			window.location.hash = `user/${login}/`;
		}
	},
	"click .fa-search": function () {
		$("#channel-input").trigger("focus");
	},
	"click #new-channel-button": function () {
		showModal("Create a new channel", `<div id="form-new-channel">
		<div class="input-wrapper">
			<span>Name</span>
			<input type="text" placeholder="Channel name" id="new-channel-name" />
		</div>
		<div class="input-wrapper">
			<span>Password (empty for no password)</span>
			<input type="password" placeholder="Password" id="new-channel-password" />
		</div>
		</div>`, () => {
			const name = $("#new-channel-name").val();
			const password = $("#new-channel-password").val();
			if (!name.length) {
				toasts.notifyError("Channel name can't be empty!");
				return false;
			}
			this.newChannel(name, () => {
				toasts.notifySuccess("The channel has been created.");
			});
			return true;
		}, () => {});
	}
  },
  render: function () {
    this.$el.html(template);
    this.renderChannels();
    this.renderMessages();
  },

  renderChannels: function () {
    $("#chat-channels").html(
      `<div id="input-container"><div id="icon-container"><i class="fas fa-search"></i></div><input type="text" id="channel-input" placeholder="Add channel" /></div>`
	);
	let list = "";
	list += "<div id=\"channels-list\">";
    this.model.forEach((channel) => {
      list += 
        `<span class="chat-channel${
          this.currentChat === channel ? " channel-current" : ""
        }">${channel.attributes.name}</span>`;
	});
	list += `<div id="autocomplete-container"></div>`;
	list += "</div>";
	$("#chat-channels").append(list);
	$("#chat-channels").append(`<div id="new-channel-button"><i class="far fa-comments"></i><span>New channel</span></div>`);
	$("#autocomplete-container").hide();
  },
  renderMessages: function () {
	const user = window.users.find(a => a.get('login') === this.currentChat.get('name'));
	const avatar = !!user ? user.get('avatar_url') : null;
    $("#chat-chat").html("");
    if (this.currentChat && this.currentMessages) {
      $("#chat-chat").append(
        `<div class="chat-header">
					${
            !!avatar
              ? `<img id="chat-avatar" src=\"${avatar}\" />`
              : ""
          }
					<span id="chat-title">${this.currentChat.attributes.name}</span>
					${!!avatar ? `<div class="button-icon"><i class="fas fa-gamepad"></i></div>
					<div class="button-icon"><i class="fas fa-ban"></i></div>` : ""}
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
	}
	if (event.target.id == "channel-input") {
		if (event.keyCode === 27) {
			event.target.blur();
		} else {
			this.autocomplete();
		}
	};
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
  newChannel(name, onSuccess = () => {}) {
	if (window.chat.find(a => a.get('name') === name)) {
		this.selectChannel(name);
		return;
	}
    // const input = $("#channel-input").val();
    if (name == "") return;
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
      data: `name=${name}`,
    });
    request.done(data => {
	  window.chat.fetch();
	  setTimeout(() => {
		  this.selectChannel(name);
		  onSuccess();
	  }, 200);
    });
  },
  autocomplete () {
	const query = $("#channel-input").val();
	let result = false;
	$("#autocomplete-container").html("");
	window.users.forEach(user => {
		if (query.length === 0 || user.get('login').indexOf(query) !== -1)
		{
			$("#autocomplete-container").append(`<span class="autocomplete-item">${user.get('login')}</span>`);
			result = true;
		}
	});
	if (!result) {
		$("#autocomplete-container").append(`<div id="autocomplete-no-result">No result found</div>`);
	}
	$("#autocomplete-container").show();
	$("#input-container .fa-search").addClass('fa-times');
  },
  closeAutocomplete() {
	setTimeout(() => {
		$("#autocomplete-container").hide();
		$("#input-container .fa-times").addClass('fa-search');
	}, 100);
  },
  selectChannel(channel) {
	let find = null;
	this.model.forEach((item) => {
	  if (item.attributes.name === channel) find = item;
	});
	if (!find)
		return;
	this.currentChat = find;
	this.currentMessages.channel_id = this.currentChannelId = find.id;
	this.ftsocket = this.newSocket(this.currentChannelId);
	this.currentMessages.fetch();
	this.renderChannels();
  }
});
