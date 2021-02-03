/* Notification panel view. The panel template is the one controlling the panel,
the list is for refreshing only the part displaying the notifications and avoid a blinking panel. */
import Backbone from 'backbone';
import template_frame from '../../templates/notification-panel.html';
import template_list from '../../templates/notification-list.html';
import {User} from '../models/User';
import _ from 'underscore';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#notifications-menu",
	initialize: function () {
		// this.listenTo(this.model, 'add', this.renderList);
		// this.listenTo(this.model, 'remove', this.renderList);
		this.listenTo(window.currentUser, 'change', this.renderList);
		this.listenTo(window.users, 'add', this.renderList);
		this.notifs = [];
	},
	events: {
		'click #notification-panel-close': function () {
			$("#notification-panel").removeClass("notification-panel-open");
		},
		'click #notification-icon': function () {
			if (this.notifs.length > 0)
				$("#notification-panel").addClass("notification-panel-open");
		},
		'click .notification-delete': function (el) {
			this.model.remove(el.currentTarget.getAttribute("notification-id"));
		},
		'click .notification-accept': function (el) {
			console.log("EL : ", el.currentTarget);
			const elId = el.currentTarget.id;
			const type = elId.split('-')[0];
			const id = parseInt(elId.split('-')[1]);
			const username = elId.split('-')[2];
			if (type === 'friend') {
				const target = new User({id: id, username: username});
				target.acceptFriend();
			}
			else if (type === 'game') {
				const target = new User({id: id, username: username});
				target.acceptGame();
			}
		}
	},
	render: function () {
		this.$el.html(_.template(template_frame)({model: this.model}));
		this.renderList();
	},
	renderList: function () {
		if (!window.currentUser.get('pending_requests'))
			return;
		this.notifs = [];
		window.currentUser.get('pending_requests').forEach(req => {
			const user = window.users.where({id: req.user_id});
			if (user.length) {
				this.notifs.push({
					title: `${user[0].get('username')} sent you a friend request`,
					type: 'friend',
					id: user[0].get('id'),
					name: user[0].get('username')
				});
			}
		});
		window.currentUser.get('game_pending_requests').forEach(req => {
			const user = window.users.where({id: req.user_id});
			if (user.length) {
				this.notifs.push({
					title: `${user[0].get('username')} sent you a game request`,
					type: 'game',
					id: user[0].get('id'),
					name: user[0].get('username')
				});
			}
		});
		if (this.notifs.length <= 0) {
			$("#notification-panel").removeClass("notification-panel-open");
			$("#notification-badge").hide();
		} else {
			$("#notification-badge").show();
			$("#notification-badge").text(this.notifs.length);
		}
		$("#notification-list").html(_.template(template_list)({notifs: this.notifs}));
	}
});