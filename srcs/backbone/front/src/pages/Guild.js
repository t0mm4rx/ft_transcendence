/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guild.html';
import {Guild, getGuildMembers} from '../models/Guild';
import _ from 'underscore';
import {showModal} from '../utils/modal';

export default Backbone.View.extend({
	el: "#page",
	initialize: function (options) {
		this.listenTo(window.users, 'add', this.render);
		this.listenTo(window.users, 'change', this.render);
		this.listenTo(window.guilds, 'add', this.render);
		this.listenTo(window.guilds, 'change', this.render);
		this.listenTo(window.currentUser, 'change', this.render);
		this.anagram = options.anagram;

	},
	events: {
		'click .message-button': function (event) {
			$(document).trigger('chat', {chat: event.currentTarget.id.split('-')[1]});
		},
		'click .user-settings': function (event) {
			const login = event.currentTarget.getAttribute("login");
			showModal("Manage rights", 
			`<div id="rights-management-wrapper"><div class="button"><span>Make owner</span></div><div class="button"><span>Make officer</span></div></div>`
			, () => {
				return true;
			}, () => true);
		},
		'click #join_guild': function()
		{
			this.guild.join();
		}
	},
	render: function () {
		this.guild = window.guilds.models.find(a =>
		{
			if (a.get('anagram') === this.anagram)
				return (a); 
		});

		console.log("Anagram : ", this.anagram);
		console.log("Guilds : ", window.guilds);
		console.log("Guild : ", this.guild);
		this.$el.html(_.template(template)({guild: this.guild}));
		this.renderUsers();
	},
	renderUsers: function () {
		this.guild = window.guilds.models.find(a => a.get('anagram') === this.anagram);
		const friends = $("#guild-users-list");
		friends.html("");
		console.log(window.users.length);
		if (!this.guild)
			return
		console.log(getGuildMembers(this.guild.id));
		getGuildMembers(this.guild.id).forEach(friend => {
			friends.append(
				`<div class="friend-item">
					<img src="${friend.get('avatar_url')}" onclick="window.location.hash='user/${friend.get('login')}/'"/>
					<b class="friend-name" onclick="window.location.hash='user/${friend.get('login')}/'">${friend.get('username')}</b>
					<span class="friend-status${friend.get('online') ? " friend-status-online" : ""}">${friend.get('online') ? "Online" : "Offline"}</span>
					<span class="button-icon message-button" id="message-${friend.get('login')}"><i class="far fa-comment"></i></span>
					${friend.get('online') ? "<span class=\"button-icon button-icon-accent\"><i class=\"fas fa-gamepad\"></i></span>" : ""}
					${!!friend.get('guild') && friend.get('guild').anagram === this.anagram ? "<i class=\"fas fa-crown owner-icon\"></i>" : ""}
					${!!window.currentUser.get('admin') ? `<span class="button-icon user-settings" login="${friend.get('login')}"><i class="fas fa-cog"></i></span>` : ""}
				</div>`
			);
		});
	}
});