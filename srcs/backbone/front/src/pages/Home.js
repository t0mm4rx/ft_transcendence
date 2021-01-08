/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/home.html'

export default Backbone.View.extend({
	el: "#page",
	events: {
		'click .message-button': function (event) {
			$(document).trigger('chat', {chat: event.currentTarget.id.split('-')[1]});
		}
	},
	render: function () {
		this.$el.html(template);
		this.renderGameList();
		this.renderFriendsList();
		this.listenTo(window.currentUser, 'change', this.renderFriendsList);
	},
	renderGameList: function () {
		const games = $("#live-game-list");
		games.html("");
		window.liveGames.forEach(game => {
			games.append(
				`<div class="game-item">
					<span><b>${game.attributes.player1}</b> vs. <b>${game.attributes.player2}</b></span>
					<span>${game.attributes.type}</span>
					<a class="button-icon button-icon-accent" onclick="window.location.hash='livestream/42/'"><i class="fas fa-tv"></i></a>
				</div>`
			);
		});
	},
	renderFriendsList: function () {
		if (!window.currentUser.get('friends'))
			return;
		const friends = $("#live-friends-list");
		friends.html("");
		window.currentUser.get('friends').forEach(friend => {
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
	}
});