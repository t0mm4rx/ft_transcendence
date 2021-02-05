/* The game model and collection. */
import Backbone from 'backbone';
import toasts from '../utils/toasts';
import $ from 'jquery';

const Guild = Backbone.Model.extend({
	declareWar: function (options, success) {
		$.ajax({
			url: `http://${window.location.hostname}:3000/api/wars/send_request`,
			type: 'POST',
			data: `target_id=${this.get('id')}`,
			success: (res) => {
				toasts.notifySuccess(`Successfully sent a war request to ${this.get('name')}.`);
				const warId = res.id;
				$.ajax({
					url: `http://${window.location.hostname}:3000/api/wars/${warId}`,
					type: 'PUT',
					data: Object.keys(options).map(a => `${a}=${options[a]}`).join("&"),
					success: () => {
						success();
					},
					error: () => {
						success();
						toasts.notifyError("Unable to update war rules.");
					}
				});
			},
			error: () => {
				toasts.notifyError('Unable to send the war request.');
			}
		});
	}
});

const Guilds = Backbone.Collection.extend({
	url: 'http://' + window.location.hostname + ':3000/api/guilds/',
	model: Guild,
	save: function (name, anagram) {
		$.ajax({
			url: 'http://' + window.location.hostname + ':3000/api/guilds/',
			type: 'POST',
			data: `name=${name}&anagram=${anagram}`,
			success: () => {
				toasts.notifySuccess(`Your guild ${name} has been created!`);
				window.guilds.fetch();
				window.currentUser.fetch();
			},
			error: (error) => {
				console.log(error);
				if (error.responseJSON.anagram) {
					let msg = "The anagram ";
					msg += error.responseJSON.anagram.join(", ");
					msg += "."
					toasts.notifyError(msg);
				}
				if (error.responseJSON.name) {
					let msg = "The name ";
					msg += error.responseJSON.name.join(", ");
					msg += "."
					toasts.notifyError(msg);
				}
			}
		});
	},
	acceptWar: function (id) {
		$.ajax({
			url: `http://${window.location.hostname}:3000/api/wars/${10}/accept_invitation`,
			type: 'POST',
			success: () => {
				toasts.notifySuccess('The war has been declared!');
				window.currentUser.fetch();
			},
			error: () => {
				toasts.notifyError('Unable to accept the request.');
			}
		});
	},
	declineWar: function () {
		$.ajax({
			url: `http://${window.location.hostname}:3000/api/wars/ignore_invitation`,
			type: 'POST',
			success: () => {
				toasts.notifySuccess('You declined the war.');
				window.currentUser.fetch();
			},
			error: () => {
				toasts.notifyError('Unable to decline the request.');
			}
		});
	}
});

const getGuildMembers = (guildId) => {
	return window.users.filter(a => !!a.get('guild') && a.get('guild').id == guildId);
}

export {Guild, Guilds, getGuildMembers};