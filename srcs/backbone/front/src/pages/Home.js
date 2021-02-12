/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/home.html'
import { Livestream } from '../models/Livestream'

export default Backbone.View.extend({
	el: "#page",
	events: {
		'click .message-button': function (event) {
			$(document).trigger('chat', {chat: event.currentTarget.id.split('-')[1]});
		},
		'click .game-button': function (event) {
			const login = event.currentTarget.id.split('-')[1];
			console.log(login);
			window.users.where('login', login).askGame();
		}
	},
	render: function () {
		this.$el.html(template);
		this.renderGameList();
		this.renderFriendsList();
		this.listenTo(window.currentUser, 'change', this.renderFriendsList);
	},
	renderGameList: async function () {
		const games = $("#live-game-list");
		games.html("");
		const to_stream = await new Livestream().gamestostream();
		console.log('To stream : ', to_stream);

		if (to_stream !== null)
		{
			games.append(
				`<div class="game-item">
					<span><b>${to_stream.player.username}</b> vs. <b>${to_stream.opponent.username}</b></span>
					<span>${to_stream.game_type}</span>
					<a class="button-icon button-icon-accent" onclick="window.location.hash='livestream/${to_stream.id}/'"><i class="fas fa-tv"></i></a>
				</div>`
			);
		}

		// window.liveGames.forEach(game => {
		// 	games.append(
		// 		`<div class="game-item">
		// 			<span><b>${game.attributes.player1}</b> vs. <b>${game.attributes.player2}</b></span>
		// 			<span>${game.attributes.type}</span>
		// 			<a class="button-icon button-icon-accent" onclick="window.location.hash='livestream/42/'"><i class="fas fa-tv"></i></a>
		// 		</div>`
		// 	);
		// });
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
					${friend.online ? `<span class="button-icon button-icon-accent game-button" id="game-${friend.login}"><i class="fas fa-gamepad"></i></span>` : ""}
				</div>`
			);
		});
	}
});