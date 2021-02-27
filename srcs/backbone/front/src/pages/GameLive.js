/**
 * GameLive, "environnement" setup page
 * for a Game Canvas. Connect the user
 * to the game using the id in the url.
*/

import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/game_live.html';
import _ from 'underscore';
import { FtSocket } from '../models/FtSocket'
import toasts from "../utils/toasts";
import { GameLive } from '../models/GameLive';
import GameCanvas from '../views/GameCanvas'

export default Backbone.View.extend({
    el: "#page",

    initialize: function()
    {
		this.game_id = window.location.hash.split('/')[1];
		this.gamelive = new GameLive();
	},
	
	events: {
		// Called by the game canvas when the game is ended.
		'end_game' : function(event, info)
		{
			this.gamelive.ended(this.game_id);
			this.ftsocket.closeConnection();
			window.currentUser.changeStatus("online");
			window.location.hash = "home";
		}
	},
	
	/**
	 * Get game informations, wait for the two player
	 * to be connected to the game and create the
	 * Game Canvas. Async beacause await.
	 * @param {this} self this.
	 */
    getGame: async function(self)
	{
		// Get the game in the backend by the model.
		self.gameinfos = await self.gamelive.gamebyid(self.game_id);

		// No game found.
		if (self.gameinfos == null || !self.gameinfos)
			return ;

		// Game found but ended or error appen.
		if (self.gameinfos.status == "ended" || self.gameinfos.errors)
		{
			toasts.notifyError("Game already ended.");
			
			// Send user to home page.
			window.location.hash = "home";
			return;
		}

		// Change current user status.
		window.currentUser.changeStatus("ingame");

		// (Visual) See players usernames.
		$("#player-name").text(self.gameinfos.player.username);
		$("#opponent-name").text(self.gameinfos.opponent.username);

		// Setup players sides.
        self.gameinfos.player.side = "left";
        self.gameinfos.opponent.side = "right";

		// Create socket with the game room.
		self.ftsocket = new FtSocket({
			id: self.gameinfos.id,
			channel: 'GameRoomChannel',
			player_id: window.currentUser.get('id'),
			display_name: window.currentUser.get('username'),
			connect_type: 'normal'
		});

		// If the game not started.
		if (self.gameinfos.status == "notstarted")
		{
			$("#game-canvas-div").append('<div id="waiting" class="panel-header"><h3>Waiting for everyone...</h3></div>');
			
			// Waiting that the two player are ready.
			self.ftsocket.socket.onmessage = function(event) {  
				const response = event.data;
				const msg = JSON.parse(response);
				
				// Ignores pings.
				if (msg.type === "ping")
					return;

				// Message "everyone_ready" sended by the backend.
				if (msg.message && msg.message.message === "everyone_here")
				{
					$("#waiting").remove();
					self.gamelive.active(self.game_id);
					self.game_canvas = new GameCanvas(self.ftsocket, self.gameinfos, "normal");
				}
			};
		}

		// The game is already active.
		else if (self.gameinfos.status == "active")
			self.game_canvas = new GameCanvas(self.ftsocket, self.gameinfos, "reconnection");
	},

    render: function() {
        var self = this;
        this.$el.html(_.template(template)({model: this.model}));  
        this.getGame(self);
	},
});