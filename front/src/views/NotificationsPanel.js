/* Notification panel view. The panel template is the one controlling the panel,
the list is for refreshing only the part displaying the notifications and avoid a blinking panel. */
import Backbone from 'backbone';
import template_frame from '../../templates/notification-panel.html';
import template_list from '../../templates/notification-list.html';
import _ from 'underscore';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#notifications-menu",
	initialize: function () {
		this.listenTo(this.model, 'add', this.renderList);
		this.listenTo(this.model, 'remove', this.renderList);
	},
	events: {
		'click #notification-panel-close': function () {
			$("#notification-panel").removeClass("notification-panel-open");
		},
		'click #notification-icon': function () {
			if (this.model.length > 0)
				$("#notification-panel").addClass("notification-panel-open");
		},
		'click .notification-delete': function (el) {
			this.model.remove(el.currentTarget.getAttribute("notification-id"));
		}
	},
	render: function () {
		this.$el.html(_.template(template_frame)({model: this.model}));
		this.renderList();
	},
	renderList: function () {
		if (this.model.length <= 0) {
			$("#notification-panel").removeClass("notification-panel-open");
			$("#notification-badge").hide();
		} else {
			$("#notification-badge").show();
			$("#notification-badge").text(this.model.length);
		}
		$("#notification-list").html(_.template(template_list)({model: this.model}));
	}
});