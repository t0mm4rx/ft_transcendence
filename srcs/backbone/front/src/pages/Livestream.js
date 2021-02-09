/* The home page. */
import Backbone from 'backbone';
import GameCanvas from '../views/GameCanvas';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'
import { Livestream } from '../models/Livestream'
import template from '../../templates/livestream.html';
import Cookies from "js-cookie";
import $ from 'jquery';
import toasts from '../utils/toasts';

export default Backbone.View.extend({
	el: "#page",

	initialize: function ()
	{
		this.model = new Livestream();
	},

	events: {
		'end_game' : function(event, info)
		{
			this.ftsocket.closeConnection();
		}
	},

	getGame: async function(self)
	{
		var gameid = window.location.hash.split('/')[1];
		console.log('GameID : ', gameid);

		self.gameinfos = await this.model.gamebyid(gameid);

		console.log("Game infos : ", self.gameinfos);

		if (self.gameinfos == null
			|| self.gameinfos.error
			|| self.gameinfos.errors)
		{
			toasts.notifyError("Game doesn't exist.");
			window.location.hash = "home";
			return;
		}
		else if (self.gameinfos.status == "ended")
		{
			toasts.notifyError("Game is ended.");
			window.location.hash = "home";
			return;
		}
		
			console.log("Avatar URL : ", self.gameinfos.player);
		$("#player_one").text(self.gameinfos.player.username);
		$("#player_one_div").attr("onclick", "window.location.hash='user/" + self.gameinfos.player.login + "/'");
		$("#player_one_image").attr("src", self.gameinfos.player.avatar_url);
		$("#player_two").text(self.gameinfos.opponent.username);
		$("#player_two_div").attr("onclick", "window.location.hash='user/" + self.gameinfos.opponent.login + "/'");
		$("#player_two_image").attr("src", self.gameinfos.opponent.avatar_url);

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