import Backbone from "backbone";

const Wars = Backbone.Collection.extend({
	url: 'http://localhost:3000/api/wars'
});

export {Wars};