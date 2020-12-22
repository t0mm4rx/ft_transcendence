/* User preview displayed in the top right corner. */
import Backbone from 'backbone';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#user-menu",
	render: function () {
		this.$el.html(`<span>${this.model.attributes.displayName}</span><img src=\"${this.model.attributes.avatar}" alt=\"User profile picture\" />`);
	}
});