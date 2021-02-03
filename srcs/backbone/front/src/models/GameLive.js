/* The game model and collection. */
import Backbone from 'backbone';
import toast from "../utils/toasts"

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

    active: async function (id)
    {
        var gameinfos = await this.gamebyid(id);

        if (gameinfos == null)
        {
            toast.notifyError("Game error. (active)");
            window.location.hash = "home";
        }

        console.log("Gameinfos : ", gameinfos);

		fetch(`http://` + window.location.hostname + `:3000/api/game_rooms/` + id,{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
			},
			body: JSON.stringify({
                player: gameinfos.player,
                opponent: gameinfos.opponent,
                status: "active",
                number_player: 2
			})
		});
    },

    ended: async function (id)
    {
        var gameinfos = await this.gamebyid(id);

        if (gameinfos == null)
        {
            toast.notifyError("Game error. (ended)");
            window.location.hash = "home";
        }

        fetch(`http://` + window.location.hostname + `:3000/api/game_rooms/` + id,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
            },
            body: JSON.stringify({
                player: gameinfos.player,
                opponent: gameinfos.opponent,
                status: "ended",
                number_player: 0
            })
        });
    }
});

const GameLiveCollection = Backbone.Collection.extend({});

export {GameLive, GameLiveCollection};