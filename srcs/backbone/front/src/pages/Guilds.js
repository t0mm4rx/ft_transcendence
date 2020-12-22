/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guilds.html';

export default Backbone.View.extend({
	el: "#page",
	render: function () {
		this.$el.html(template);
	}
});