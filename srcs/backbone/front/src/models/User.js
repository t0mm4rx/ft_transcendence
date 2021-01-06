/* The model representing a user. */
import Backbone from 'backbone';
import $ from 'jquery';

const User = Backbone.Model.extend({
	url: "http://localhost:3000/api/users/me",
	save: function (key, value) {
		console.log("Url", `http://localhost:3000/api/users/${window.currentUser.get('id')}/`);
		$.ajax({
			url: `http://localhost:3000/api/users/${window.currentUser.get('id')}/`,
			type: 'PUT',
			data: `${key}=${value}`,
			success: () => {
				window.currentUser.set(key, value);
			}
		});
	},
	parse: function(data) {
		// if (data.length === 1)
		// 	return data[0];
		return data;
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