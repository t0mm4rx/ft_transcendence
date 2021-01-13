/* The model representing a user. */
import Backbone from 'backbone';
import $ from 'jquery';
import toasts from '../utils/toasts';

const User = Backbone.Model.extend({
	urlRoot: `http://localhost:3000/api/users/`,
	save: function (key, value) {
		$.ajax({
			url: `http://localhost:3000/api/users/${window.currentUser.get('id')}/`,
			type: 'PUT',
			data: `${key}=${value}`,
			success: () => {
				window.currentUser.set(key, value);
			}
		});
	},
	askFriend: function () {
		$.ajax({
			url: `http://localhost:3000/api/friends/`,
			type: 'POST',
			data: `id=${this.get('id')}`,
			success: () => {
				this.set('relation_to_user', 'request sent');
				toasts.notifySuccess("Friend request sent.");
			},
			error: err => {
				toasts.notifyError("Cannot send a friend request.");
				console.log(err);
			}
		});
	},
	unfriend: function () {
		$.ajax({
			url: `http://localhost:3000/api/friends/${this.get('id')}/`,
			type: 'DELETE',
			success: () => {
				this.set('relation_to_user', null);
				if (this.get('login'))
					toasts.notifySuccess(`${this.get('login')} is not your friend anymore.`);
				else
					toasts.notifySuccess(`You're not friends anymore.`);
				window.currentUser.fetch();
			},
			error: err => {
				console.log(err);
			}
		});
	},
	acceptFriend: function () {
		$.ajax({
			url: `http://localhost:3000/api/friends/${this.get('id')}`,
			type: 'PUT',
			success: () => {
				this.set('relation_to_user', 'friends');
				if (this.get('login'))
					toasts.notifySuccess(`${this.get('login')} is now your friend.`);
				else
					toasts.notifySuccess(`You have a new friend!`);
				window.currentUser.fetch();
			},
			error: err => {
				console.log(err);
				toasts.notifyError("An error occured.");
			}
		});
	},
	setTFA: function () {
		$.ajax({
			url: 'http://localhost:3000/api/tfa',
			type: 'POST'
		});
	}
});

const Users = Backbone.Collection.extend({
	model: User,
	url: "http://localhost:3000/api/users?limit=20",
	// parse: function (data) {
	// 	data.forEach(el => {
	// 		this.add(new User(el));
	// 	});
	// }
});

const Friends = Backbone.Collection.extend({
	
});

export {User, Friends, Users};