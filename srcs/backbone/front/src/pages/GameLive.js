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

		if (self.gameinfos == null)
			return ;

		if (self.gameinfos.status == "ended")
		{
			toasts.notifyError("Game already ended.");
			window.location.hash = "home";
			return;
		}

		self.gameinfos.player = JSON.parse(self.gameinfos.player);
        self.gameinfos.opponent = JSON.parse(self.gameinfos.opponent);

		$("#player-name").text(self.gameinfos.player.name);
		$("#opponent-name").text(self.gameinfos.opponent.name);

        self.gameinfos.player.side = "left";
        self.gameinfos.opponent.side = "right";

		self.ftsocket = new FtSocket({
			id: self.gameinfos.id,
			channel: 'GameRoomChannel',
			connect_type: 'normal'
		});

		setTimeout(function() {
			self.gamelive.active(self.game_id);
			self.game = new GameCanvas(self.ftsocket, self.gameinfos, "normal");
		}, 1000);
	},

    render: function() {
        var self = this;
        this.$el.html(_.template(template)({model: this.model}));  
        this.getGame(self);
    }
});