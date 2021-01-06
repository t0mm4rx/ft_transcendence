/* User preview displayed in the top right corner. */
import Backbone from 'backbone';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#user-menu",
	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
	},
	events: {
		'click': function () {
			window.location.hash=`user/${window.currentUser.get('login')}/`;
		}
	},
	render: function () {
		this.$el.html(`<span>${this.model.get('username')}</span><img src=\"${this.model.get('avatar_url') || ""}" alt=\"User profile picture\" />`);
	}
});