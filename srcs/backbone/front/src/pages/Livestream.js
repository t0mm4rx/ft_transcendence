/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.$el.html(
			`<div class="panel" id="livestream-panel">
				<canvas id="game"></canvas>
				<div id="stream-infos">
					<h2><div class="blinking-live"></div>Livestream</h2>
					<span>Direct game</span>
					<span>2 watching</span>
					<div id="opponents-container">
						<div class="opponent" onclick="window.location.hash='user/fake/'">
							<img src="https://randomuser.me/api/portraits/men/20.jpg" />
							<span>Player 1</span>
						</div>
						<span>vs.</span>
						<div class="opponent" onclick="window.location.hash='user/fake/'">
							<img src="https://randomuser.me/api/portraits/women/13.jpg" />
							<span>Player 2</span>
						</div>
					</div>
				</div>
			</div>`
		);
	}
});