/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/admin.html';

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.$el.html(template);
		this.renderChannelsList();
	},
	renderChannelsList: function () {
		const list = $("#channels-listing");
		list.html("");
		const channels = [
			"Test", "test 42",
			"International Killers", "efjsiofjseo",
			"efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			// "efjiejfie", "hfiusehfiuesh",
			"efjiejfie", "hfiusehfiuesh",
		];
		channels.forEach(channel => {
			list.append(
				`<div class="channel-item">
					<span>${channel}</span>
					<div class="button-icon"><i class="fas fa-eye"></i></div>
					<div class="button-icon"><i class="fas fa-minus-circle"></i></div>
				</div>`
				);
		});
	}
});