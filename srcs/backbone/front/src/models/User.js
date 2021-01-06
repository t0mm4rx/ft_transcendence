/* The model representing a user. */
import Backbone from 'backbone';

const User = Backbone.Model.extend({
	url: "http://localhost:3000/api/users/",
	parse: function(data) {
		return data[0];
	}
});

const Friends = Backbone.Collection.extend({
	
});

export {User, Friends};