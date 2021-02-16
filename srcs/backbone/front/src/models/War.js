import Backbone from "backbone";

const Wars = Backbone.Collection.extend({
	url: `http://${window.location.hostname}:3000/api/wars`
});

export {Wars};