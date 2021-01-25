/* The game model and collection. */
import Backbone from 'backbone';
import toasts from '../utils/toasts';
import $ from 'jquery';

const Guild = Backbone.Model.extend({});

const Guilds = Backbone.Collection.extend({
	url: 'http://localhost:3000/api/guilds/',
	save: function (name, anagram) {
		$.ajax({
			url: 'http://localhost:3000/api/guilds/',
			type: 'POST',
			data: `name=${name}&anagram=${anagram}`,
			success: () => {
				toasts.notifySuccess(`Your guild ${name} has been created!`);
				window.guilds.fetch();
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
	}
});

const getGuildMembers = (guildId) => {
	return window.users.filter(a => !!a.get('guild') && a.get('guild').id == guildId);
}

export {Guild, Guilds, getGuildMembers};