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
				this.set('relation_to_user', 'eifjeis');
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
				this.set('relation_to_user', 'eifjeis');
				toasts.notifySuccess(`${this.get('login')} is now your friend.`);
			},
			error: err => {
				console.log(err);
				toasts.notifyError("An error occured.");
			}
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