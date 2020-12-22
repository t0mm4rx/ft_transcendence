/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/home.html';

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.$el.html(template);
		this.renderGameList();
	},
	renderGameList: function () {
		const list = $("#live-game-list");
		list.html("");
		window.liveGames.forEach(game => {
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