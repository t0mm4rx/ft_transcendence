/* The page layout present on every page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/layout.html';

export default Backbone.View.extend({
	render: function () {
		$("body").html(template);
	}
});