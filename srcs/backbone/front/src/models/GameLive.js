/* The game model and collection. */
import Backbone from 'backbone';
import toast from "../utils/toasts"
import $ from 'jquery';
import toasts from "../utils/toasts";

const GameLive = Backbone.Model.extend({
    urlRoot: `http://` + window.location.hostname + `:3000/api/game_rooms/`,

    gamebyid: async function(id) {

        var rtn;
		await fetch(`http://` + window.location.hostname + `:3000/api/game_rooms/` + id, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
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

    sleep: function (ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    active: function (id)
    {
        $.ajax({
            url: `http://` + window.location.hostname + `:3000/api/game/` + id + `/update_status`,
            type: "POST",
            data: `id=${id}&status=active`,
            success: () => {
            },
            error: (err) => {
              toasts.notifyError("Set active problem.");
              console.log(err);
            },
        });
    },

    ended: function (id)
    {
        $.ajax({
            url: `http://` + window.location.hostname + `:3000/api/game/` + id + `/update_status`,
            type: "POST",
            data: `id=${id}&status=ended`,
            success: () => {
            },
            error: (err) => {
              toasts.notifyError("Set ended problem.");
              console.log(err);
            },
        });
    }
});

const GameLiveCollection = Backbone.Collection.extend({});

export {GameLive, GameLiveCollection};