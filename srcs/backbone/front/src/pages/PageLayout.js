/* The page layout present on every page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/layout.html';

export default Backbone.View.extend({
	initialize: function () {
		this.listenTo(window.currentUser, 'change', this.checkAdminButton);
	},
	checkAdminButton: function () {
		if (!!window.currentUser.get('admin'))
			$("#admin-button").css("display", "initial");
		else
			$("#admin-button").css("display", "none");
	},
	render: function () {
		this.checkAdminButton();
		$("body").html(template);
	}
});