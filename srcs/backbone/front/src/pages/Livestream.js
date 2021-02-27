/**
 * Livestream, page where another user
 * of the website can see a match.
*/

import Backbone from 'backbone';
import GameCanvas from '../views/GameCanvas';
import { FtSocket } from '../models/FtSocket'
import { Livestream } from '../models/Livestream'
import template from '../../templates/livestream.html';
import $ from 'jquery';
import toasts from '../utils/toasts';

export default Backbone.View.extend({
	el: "#page",

	initialize: function ()
	{
		this.model = new Livestream();
	},

	events: {
		// Event called when a game is ended.
		'end_game' : function(event, info)
		{
			this.ftsocket.closeConnection();
		}
	},

	// Similar to GameLive but here the user just watch the game
	getGame: async function(self)
	{
		// Get game id.
		var gameid = window.location.hash.split('/')[1];
		self.gameinfos = await this.model.gamebyid(gameid);

		// Game found but ended or error appen.
		if (self.gameinfos == null
			|| self.gameinfos.error
			|| self.gameinfos.errors)
		{
			// Send user to home page.
			toasts.notifyError("Game doesn't exist.");
			window.location.hash = "home";
			return;
		}
		else if (self.gameinfos.status == "ended")
		{
			// Send user to home page.
			toasts.notifyError("Game is ended.");
			window.location.hash = "home";
			return;
		}
		
		// Update players informations in the panel.
		$("#player_one").text(self.gameinfos.player.username);
		$("#player_one_div").attr("onclick", "window.location.hash='user/" + self.gameinfos.player.login + "/'");
		$("#player_one_image").attr("src", self.gameinfos.player.avatar_url);
		$("#player_two").text(self.gameinfos.opponent.username);
		$("#player_two_div").attr("onclick", "window.location.hash='user/" + self.gameinfos.opponent.login + "/'");
		$("#player_two_image").attr("src", self.gameinfos.opponent.avatar_url);

		// Connect the user to the game room.
		self.ftsocket = new FtSocket({
			id: self.gameinfos.id,
			channel: 'GameRoomChannel',
			connect_type: 'live'
		});

		// Add game canvas.
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