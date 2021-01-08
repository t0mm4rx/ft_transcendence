/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/user.html';
import { User } from '../models/User';
import _ from 'underscore';

export default Backbone.View.extend({
	el: "#page",
	events: {
		'click #user-friend-badge': function () {
			if (confirm(`Are your sure you want to unfriend ${this.user.get('username')} ?`)) {
				this.user.unfriend();
			}
		},
		'click #user-add-friend': function () {
			this.user.askFriend();
		},
		'click .message-button': function (event) {
			$(document).trigger('chat', {chat: event.currentTarget.id.split('-')[1]});
		}
	},
	initialize: function (options) {
		this.login = options.login;
		this.user = new User();
		this.listenTo(window.currentUser, 'change', this.fetchUser);
		this.listenTo(window.users, 'add', this.fetchUser);
		this.listenTo(this.user, 'change', this.render);
		this.fetchUser();
	},
	fetchUser: function () {
		this.preview = window.users.models.find(a => a.get('login') === this.login);
		if (this.preview) {
			this.user.set('id', this.preview.id);
			this.user.fetch();
		}
	},
	render: function () {
		this.$el.html(_.template(template)({data: this.user.attributes}));
		this.renderFriendsList();
	},
	renderFriendsList: function () {
		if (!this.user.get('friends'))
			return;
		const friends = $("#friends-panel-content");
		friends.html("");
		this.user.get('friends').forEach(friend => {
			friends.append(
				`<div class="friend-item">
					<img src="${friend.avatar_url}" onclick="window.location.hash='user/${friend.login}/'"/>
					<b class="friend-name" onclick="window.location.hash='user/${friend.login}/'">${friend.username}</b>
					<span class="friend-status${friend.online ? " friend-status-online" : ""}">${friend.online ? "Online" : "Offline"}</span>
					<span class="button-icon message-button" id="message-${friend.login}"><i class="far fa-comment"></i></span>
					${friend.online ? "<span class=\"button-icon button-icon-accent\"><i class=\"fas fa-gamepad\"></i></span>" : ""}
				</div>`
			);
		});
	},
});