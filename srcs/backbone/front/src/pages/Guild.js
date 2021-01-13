/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guild.html';

export default Backbone.View.extend({
	el: "#page",
	initialize: function () {
		this.listenTo(window.users, 'add', this.renderUsers);
	},
	render: function () {
		this.$el.html(template);
		this.renderUsers();
	},
	renderUsers: function () {
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