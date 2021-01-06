/* The model representing a user. */
import Backbone from 'backbone';
import $ from 'jquery';
import {logout} from '../utils/globals';

const User = Backbone.Model.extend({
	url: "http://localhost:3000/api/users/",
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
		return data[0];
	}
});

const Friends = Backbone.Collection.extend({
	
});

export {User, Friends};