/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/user.html';
import { User } from '../models/User';
import _ from 'underscore';

export default Backbone.View.extend({
	el: "#page",
	initialize: function (options) {
		this.login = options.login;
		this.user = new User();
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
					<span class="button-icon"><i class="far fa-comment"></i></span>
					${friend.online ? "<span class=\"button-icon button-icon-accent\"><i class=\"fas fa-gamepad\"></i></span>" : ""}
				</div>`
			);
		});
	},
});