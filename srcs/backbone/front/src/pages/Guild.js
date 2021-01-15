/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guild.html';
import _ from 'underscore';

export default Backbone.View.extend({
	el: "#page",
	initialize: function (options) {
		this.listenTo(window.users, 'add', this.render);
		this.listenTo(window.users, 'change', this.render);
		this.anagram = options.anagram;
	},
	events: {
		'click .message-button': function (event) {
			$(document).trigger('chat', {chat: event.currentTarget.id.split('-')[1]});
		}
	},
	render: function () {
		this.guild = window.guilds.where('anagram', this.anagram);
		this.$el.html(_.template(template)({guild: this.guild}));
		this.renderUsers();
	},
	renderUsers: function () {
		this.guild = window.guilds.where('anagram', 'IAKL');
		const friends = $("#guild-users-list");
		friends.html("");
		console.log(window.users.length);
		window.users.forEach(friend => {
			friends.append(
				`<div class="friend-item">
					<img src="${friend.get('avatar_url')}" onclick="window.location.hash='user/${friend.get('login')}/'"/>
					<b class="friend-name" onclick="window.location.hash='user/${friend.get('login')}/'">${friend.get('username')}</b>
					<span class="friend-status${friend.get('online') ? " friend-status-online" : ""}">${friend.get('online') ? "Online" : "Offline"}</span>
					<span class="button-icon message-button" id="message-${friend.get('login')}"><i class="far fa-comment"></i></span>
					${friend.get('online') ? "<span class=\"button-icon button-icon-accent\"><i class=\"fas fa-gamepad\"></i></span>" : ""}
					${friend.get('login') === 'rchallie' ? "<i class=\"fas fa-crown owner-icon\"></i>" : ""}
				</div>`
			);
		});
	}
});