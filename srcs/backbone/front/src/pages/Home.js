/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/home.html';
import {Game, GameCollection} from '../models/Game';

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.liveGames = new GameCollection();
		this.liveGames.add(new Game({
			player1: "Jean",
			player2: "Romain",
			type: "War game"
		}));
		this.liveGames.add(new Game({
			player1: "Fredrika",
			player2: "Mathis",
			type: "Direct game"
		}));
		this.liveGames.add(new Game({
			player1: "Manu",
			player2: "Donald",
			type: "Ladder game"
		}));
		this.$el.html(template);
		this.renderGameList();
	},
	renderGameList: function () {
		const list = $("#live-game-list");
		list.html("");
		this.liveGames.forEach(game => {
			list.append(
				`<div class="game-item">
					<span><b>${game.attributes.player1}</b> vs. <b>${game.attributes.player2}</b></span>
					<span>${game.attributes.type}</span>
					<a class="button-icon button-icon-accent"><i class="fas fa-tv"></i></a>
				</div>`
			);
		});
	}
});