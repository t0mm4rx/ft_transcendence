/* The game model and collection. */
import Backbone from 'backbone';
import $ from 'jquery';
import toasts from "../utils/toasts";
import Cookies from "js-cookie";


const GameLive = Backbone.Model.extend({
    urlRoot: `http://` + window.location.hostname + `:3000/api/game_rooms/`,

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
              console.log("Set active game error : ", err);
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
              console.log("Set ended game error: ", err);
            },
        });
    }
});

const GameLiveCollection = Backbone.Collection.extend({});

export {GameLive, GameLiveCollection};