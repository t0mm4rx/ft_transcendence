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
			const elId = el.currentTarget.getAttribute('notification-id');
			const type = elId.split('-')[0];
			const id = parseInt(elId.split('-')[1]);
			if (type === 'friend') {
				window.users.models.find(a => a.get('id') === 3).unfriend();
			}
			if (type === 'war') {
				window.guilds.declineWar();
			}
		},
		'click .notification-accept': function (el) {
			const elId = el.currentTarget.getAttribute('notification-id');
			const type = elId.split('-')[0];
			const id = parseInt(elId.split('-')[1]);
			if (type === 'friend') {
				const target = new User({id: id});
				target.acceptFriend();
			}
			if (type === 'war') {
				window.guilds.acceptWar();
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
					id: user[0].get('id')
				});
			}
		});
		if (window.currentUser.get('guild') && window.currentUser.get('guild').war_invites) {
			const guild_id = window.currentUser.get('guild').war_invites;
			const guild = window.guilds.where('id', guild_id);
			this.notifs.push({
				title: `${guild.get('name')} declares war to your guild`,
				type: 'war',
				id: 0
			});
		}
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