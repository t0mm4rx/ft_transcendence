import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/game_live.html';
import _ from 'underscore';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'
import toasts from "../utils/toasts";
import {GameLive} from '../models/GameLive';
import GameCanvas from '../views/GameCanvas'

export default Backbone.View.extend({
    el: "#page",

    initialize: function()
    {
		this.game_id = window.location.hash.split('/')[1];
		this.gamelive = new GameLive();
	},
	
	events: {
		'end_game' : function(event, info)
		{
			this.gamelive.ended(this.game_id);
			this.ftsocket.closeConnection();
			window.location.hash = "home";
		}
	},
    
    getGame: async function(self)
	{
		self.gameinfos = await self.gamelive.gamebyid(self.game_id);

		if (self.gameinfos == null || !self.gameinfos)
			return ;

		console.log("Self Gameinfos : ", self.gameinfos);

		if (self.gameinfos.status == "ended" || self.gameinfos.errors)
		{
			toasts.notifyError("Game already ended.");
			window.location.hash = "home";
			return;
		}

		$("#player-name").text(self.gameinfos.player.username);
		$("#opponent-name").text(self.gameinfos.opponent.username);

        self.gameinfos.player.side = "left";
        self.gameinfos.opponent.side = "right";

		self.ftsocket = new FtSocket({
			id: self.gameinfos.id,
			channel: 'GameRoomChannel',
			player_id: window.currentUser.get('id'),
			display_name: window.currentUser.get('username'),
			connect_type: 'normal'
		});

		setTimeout(function() {

			if (self.gameinfos.status == "active")
				self.game = new GameCanvas(self.ftsocket, self.gameinfos, "reconnection");
			else if (self.gameinfos.status == "notstarted")
			{
				self.gamelive.active(self.game_id);
				self.game = new GameCanvas(self.ftsocket, self.gameinfos, "normal");
			}
			
		}, 1000);
	},

    render: function() {
        var self = this;
        this.$el.html(_.template(template)({model: this.model}));  
        this.getGame(self);
    }
});