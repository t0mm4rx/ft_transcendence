/* Chat panel view. Like the notification panel, the frame template is used to open/close the panel.*/
import Backbone from 'backbone';
import template from '../../templates/chat.html';
import $ from 'jquery';

export default Backbone.View.extend({
	initialize: function () {
		this.currentChat = this.model.where('name', 'magrosje');
		this.listenTo(this.model, 'add', this.renderChannels);
		this.listenTo(this.currentChat, 'change', this.renderChat);
	},
	el: "#chat-container",
	events: {
		'click #chat-panel-close': function () {
			$("#chat-panel").removeClass("chat-panel-open");
		},
		'click #chat-icon': function () {
			$("#chat-panel").addClass("chat-panel-open");
		},
		'click .chat-channel': function (el) {
			let find = null;
			this.model.forEach(item => {
				if (item.attributes.name === el.target.innerText)
					find = item;
			});
			this.currentChat = find;
			this.renderChannels();
			this.renderMessages();
		}
	},
	render: function () {
		this.$el.html(template);
		this.renderChannels();
		this.renderMessages();
	},
	renderChannels: function () {
		$("#chat-channels").html("");
		this.model.forEach(channel => {
			$("#chat-channels").append(
				`<span class="chat-channel${this.currentChat === channel ? " channel-current" : ""}">${channel.attributes.name}</span>`
			);
		});
	},
	renderMessages: function () {
		$("#chat-chat").html("");
		if (this.currentChat) {
			$("#chat-chat").append(
				`<div class="chat-header">
					${!!this.currentChat.attributes.avatar ? `<img src=\"${this.currentChat.attributes.avatar}\" />` : ""}
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
	renderChat: function() {
		$("#chat-messages").html();
		let lastUser = null;
		this.currentChat.attributes.messages.forEach(message => {
			let html = "";
			html += `<div class=\"chat-message-container ${message.from === window.currentUser.attributes.login ? "chat-message-container-me" : ""} ${lastUser === message.from ? "chat-message-container-no-margin" : ""}\">`;
			if (lastUser !== message.from)
				html +=
					`<div class="chat-message-infos"><span>${message.from}</span><span>${new Date(message.date).toISOString().split('.')[0].replace('T', ' ')}</span></div>`
				;
			html += `<span class="chat-message">${message.message}</span>`;
			html += "</div>";
			lastUser = message.from;
			$("#chat-messages").append(html);
		});
		document.querySelector("#chat-messages").scrollTop = document.querySelector("#chat-messages").scrollHeight;
	}
});