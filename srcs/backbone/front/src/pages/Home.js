/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/home.html'

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.$el.html(template);
		this.renderGameList();
	},
	renderGameList: function () {
		const games = $("#live-game-list");
		const friends = $("#live-friends-list");
		games.html("");
		friends.html("");
		window.liveGames.forEach(game => {
			games.append(
				`<div class="game-item">
					<span><b>${game.attributes.player1}</b> vs. <b>${game.attributes.player2}</b></span>
					<span>${game.attributes.type}</span>
					<a class="button-icon button-icon-accent" onclick="window.location.hash='livestream/42/'"><i class="fas fa-tv"></i></a>
				</div>`
			);
		});
		window.friends.forEach(friend => {
			friends.append(
				`<div class="friend-item">
					<img src="${friend.attributes.avatar}" alt="${friend.attributes.login}'s profile picture" onclick="window.location.hash='user/${friend.attributes.login}/'"/>
					<b class="friend-name" onclick="window.location.hash='user/${friend.attributes.login}/'">${friend.attributes.displayName}</b>
					<span class="friend-status${friend.attributes.status.indexOf("online") >= 0 ? " friend-status-online" : ""}">${friend.attributes.status}</span>
					<span class="button-icon"><i class="far fa-comment"></i></span>
					${friend.attributes.status === "online" ? "<span class=\"button-icon button-icon-accent\"><i class=\"fas fa-gamepad\"></i></span>" : ""}
				</div>`
			);
		});
	}
});