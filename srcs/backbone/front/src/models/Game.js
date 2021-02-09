/* The game model and collection. */
import Backbone from 'backbone';
import Cookies from "js-cookie";
import { User, Friends, Users } from "../models/User";
import toast from '../utils/toasts'

const Game = Backbone.Model.extend({

    findGameWithoutOpponent: async function()
    {
        var rtn;
		await fetch(`http://` + window.location.hostname + `:3000/api/game/match_no_opponent`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			}
		})
		.then(response => response.json())
		.then(searchResult => {

			// Create new match if no one was found
			if (searchResult === null)
                rtn = null;
            else
                rtn = searchResult
        });
        
        return (rtn);
    },

    createNewGame: function ()
    {
        const user = new User({id: -1});
        user.askGame(false);
    },

    joinGame: async function(game_infos)
    {
        fetch(`http://` + window.location.hostname + `:3000/api/game/` + game_infos.id + `/change_opponent`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + Cookies.get("user")
          },
          body: JSON.stringify({
            userid: game_infos.user_id,
            opponentid: window.currentUser.get('id') 
          })
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        })
        .then(createResult => {
          
            if (createResult.error)
                toast.notifyError("Change opponent id : " + createResult.error);
            else
            {
                const user = new User({id: game_infos.user_id});
                user.acceptGame(game_infos.id);
            }
        })
        .catch(error => console.log(error));
    },

    isDisconnected: async function ()
    {
		// Return value.
		var rtn;

		// Request to the backend.
		await fetch(`http://` + window.location.hostname + `:3000/api/game/is_disconnected`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			},
			body: JSON.stringify({
				user_id: window.currentUser.get('id')
			})
		})
		.then(response => response.json())
		.then(searchResult => {

			// Check the response of the backend.
			if (searchResult == null)
                rtn = null;
            else
                rtn = searchResult;

        });

		return (rtn);
    },

    updateScore: function(game_id, player_score, opponent_score)
    {
		// Request to the backend.
		fetch(`http://` + window.location.hostname + `:3000/api/game/` + game_id + `/update_score`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + Cookies.get("user")
			},
			body: JSON.stringify({
                player_score: player_score,
                opponent_score: opponent_score
			})
		});
    }
});

const GameCollection = Backbone.Collection.extend({});

export {Game, GameCollection};