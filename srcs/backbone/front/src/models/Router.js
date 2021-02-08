/* The notification model and collection. */
import Backbone from 'backbone';
import Cookies from "js-cookie";

const Router = Backbone.Model.extend({
    clearRequests()
    {
        // Request to the backend.
		fetch(`http://` + window.location.hostname + `:3000/api/game/` + window.currentUser.get('id') + `/destroy_empty_requests`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			}
		});
    }    
});

const RouterCollection = Backbone.Collection.extend({});

export {Router, RouterCollection};