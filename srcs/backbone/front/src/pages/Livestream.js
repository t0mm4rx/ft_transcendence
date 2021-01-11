/* The home page. */
import Backbone from 'backbone';
import GameCanvas from '../views/GameCanvas';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'
import template from '../../templates/livestream.html';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#page",

	events: {
		'end_game' : function(event, info)
		{
			this.ftsocket.closeConnection();
		}
	},

	getGameByID: async function(id)
	{
		var rtn;
		await fetch(`http://localhost:3000/api/game_rooms/` + id, {
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

	getGame: async function(self)
	{
		var gameid;

		// TMP
		await fetch(`http://localhost:3000/api/game/tmp_last_game`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
			}
		})
		.then(response => response.json())
		.then(searchResult => {
			if (searchResult == null)
				gameid = -1;
			else
				gameid = searchResult.id;
		});

		//tmp
		if (gameid == -1)
			return ;

		self.gameinfos = await this.getGameByID(gameid);

		//tmp
		if (self.gameinfos == null)
			return ;
		
		self.gameinfos.player = JSON.parse(self.gameinfos.player);
		$("#player_one").text(self.gameinfos.player.name);

		self.gameinfos.opponent = JSON.parse(self.gameinfos.opponent);
		$("#player_two").text(self.gameinfos.opponent.name);

		console.log(self.gameinfos);

		self.ftsocket = new FtSocket({
			id: self.gameinfos.id,
			channel: 'GameRoomChannel',
			connect_type: 'live'
		});

		setTimeout(function() {
			self.game = new GameCanvas(self.ftsocket, self.gameinfos, "live");
		}, 1000);
	},

	render: function () {
		var self = this;
		this.$el.html(template);
		this.getGame(self);
	}
});