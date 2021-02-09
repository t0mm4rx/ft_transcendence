/* The Livestream model and collection. */
import Backbone from 'backbone';
import Cookies from 'js-cookie';

const Livestream = Backbone.Model.extend({

    gamebyid: async function(id) {

        var rtn;
		await fetch(`http://` + window.location.hostname + `:3000/api/game_rooms/` + id, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			}
		})
		.then(response => response.json())
		.then(searchResult => {

			if (searchResult == null)
				rtn = null;
			else
				rtn = searchResult;
		});

		return (rtn);
    },

    gamestostream: async function()
    {
        var rtn;
		await fetch(`http://` + window.location.hostname + `:3000/api/game/livestream_games`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			}
		})
		.then(response => response.json())
		.then(searchResult => {

			if (searchResult == null)
				rtn = null;
			else
				rtn = searchResult;
		});

		return (rtn);
    }

});

const LivestreamCollection = Backbone.Collection.extend({});

export {Livestream, LivestreamCollection};