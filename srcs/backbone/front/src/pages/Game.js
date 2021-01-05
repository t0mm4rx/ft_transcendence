/* The game page. */
import Backbone, { View } from 'backbone';
import $ from 'jquery';
import _, { create } from 'underscore'
import template from '../../templates/game.html';
import p5 from 'p5';
import {Game, GameCollection} from '../models/Game';
import GameCanvas from '../views/GameCanvas';
import {FtSocket, FtSocketCollection} from '../models/FtSocket'

export default Backbone.View.extend({
	el: "#page",

	/**
	 * General informations :
	 *  Here the "player" is the game creator, the "opponent"
	 *  is the player how find the game created by "player".
	 *  See "createNewGame()", "joinGame()" and backend "game_room"
	 *  part.
	 * 
	 * Actualy :
	 *  Just work with normal game.
	 */

	/**
	 * Initialize game page.
	 */
	initialize: function()
	{
		this.self = this;
	},

	/**
	 * Click on button "Find normal game" (#game-normal):
	 * 		Find a new normal game.
	 * (Temporary) Click on button "Change current user" (#change-user):
	 * 		Set other current user attribute.
	 * End game event (end_game) :
	 * 		Event triggered by "GameCanvas". "info" contain
	 * 		the game information.
	 */
	events: {
		'click #game-normal' : function() {
			this.findNormal();
		},
		'click #change-user' : function() {
			window.currentUser.attributes.id = 589;
			window.currentUser.attributes.displayName = "Mathis";
		},
		'end_game' : function(event, info)
		{
			console.log("Info:", info);
			// Update game data on backend part
			fetch(`http://localhost:3000/api/game_rooms/` + info.game_id,{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
				},
				body: JSON.stringify({
					status: "ended"
				})
			});

			this.$el.html(template);
		}
	},

	/**
	 *  Setup "GameCanvas" environment.
	 *  Game creator "player" is on left of the
	 *  "GameCanvas", the "opponent" on right.
	 *  Start the game by creating new object "GameCanvas".
	 * 
	 * @param {*} panel the game panel element (#game-panel)
	 * @param {*} self this view, given because this function
	 * is used "asyncly".
	 */
	startGame: function(panel, self)
	{
		panel.html(`
			<div id="game-canvas-div">
				<canvas id="game-canvas" width="600" height="400"></canvas>
			</div>
		`);
		
		self.gameinfos.player.side = "left";
		self.gameinfos.opponent.side = "right";

		self.game = new GameCanvas(self.ftsocket, self.gameinfos);
	},

	/**
	 *  Change panel to display that a game was found.
	 *  Show players names. Wait a little bit "for the show".
	 * 
	 * @param {*} panel the game panel element (#game-panel)
	 * @param {*} self this view, given because this function
	 * is used "asyncly".
	 */
	gameFound: function(panel, self)
	{
		panel.html(`
			<h1>Oppenent found !</h1>
			<h3>` 
			+ self.gameinfos.player.name
			+ ` vs `
			+ self.gameinfos.opponent.name
		);

		// Wait 3 secondes to "start", for the show.
		setTimeout(function() {
			self.startGame(panel, self);
		}, 3000);
	},

	/**
	 *  Create a new game by asking to the backend
	 *  to create it, connect current user to the 
	 *  game socket and set socket to wait "everyone_ready"
	 *  message. "everyone_ready" is the message sended by
	 *  the opponent who joining the game.
	 * 
	 * @param {*} panel the game panel element (#game-panel)
	 * @param {*} self this view, given because this function
	 * is used "asyncly".
	 */
	createNewGame: function(self, panel)
	{
		// /!\ To change to be the actual url
		// Ask the backend to create the "game_room".
		fetch(`http://localhost:3000/api/game_rooms`,{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
			},
			body: JSON.stringify({
				player: JSON.stringify({
					name: window.currentUser.attributes.displayName,
					id: window.currentUser.attributes.id
				}),
				opponent: "",
				status: "active"
			})
		})
		.then(res => res.json())
		.then(createResult => {

			self.gameinfos = createResult;

			// Get "player" (game creator, this client) informations.
			self.gameinfos.player = JSON.parse(self.gameinfos.player);

			// Create new socket between frontend and backend
			self.ftsocket = new FtSocket({id: createResult.id, channel: 'GameRoomChannel'});

			/* 
			* Setup the socket to catch "everyone_ready" message to
			* start the game.
			*/
			self.ftsocket.socket.onmessage = function(event) { 
				
				const event_res = event.data;
				const msg = JSON.parse(event_res);

				// Ignores pings.
				if (msg.type === "ping")
					return;
				
				if (msg.message && msg.message.message == "everyone_ready")
				{
					// Get opponent informations
					self.gameinfos.opponent = msg.message.content;

					// "Start" the game for this client.
					self.gameFound(panel, self);
				}
			};
		});
	},

	/**
	 * Update this game informations, backend "game_room"
	 * informations, connect the client to the game socket
	 * "start" the game for the client.
	 * 
	 * @param {*} panel the game panel element (#game-panel)
	 * @param {*} self this view, given because this function
	 * is used "asyncly".
	 */
	joinGame: function(self, panel)
	{
		/*
		* Setup the informations about the opponent 
		* (this client because it joining).
		*/
		var opponent_infos = {
			name: window.currentUser.attributes.displayName,
			id: window.currentUser.attributes.id
		}

		/*
		* Add "player" (other client) & "opponent" (this client)
		* to the game informations
		*/
		self.gameinfos.player = JSON.parse(self.gameinfos.player);
		self.gameinfos.opponent = opponent_infos;

		// Update game data on backend part
		fetch(`http://localhost:3000/api/game_rooms/` + self.gameinfos.id,{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
			},
			body: JSON.stringify({
				player: JSON.stringify(self.gameinfos.player),
				opponent: JSON.stringify(self.gameinfos.opponent)
			})
		});

		// Connect this client to the "game_room" socket.
		self.ftsocket = new FtSocket({id: self.gameinfos.id, channel: 'GameRoomChannel'});

		/*
		* Send the "everyone_ready" message to the "player" (other client).
		* "Start" the game for this client. Executed after 2 secondes to be
		* sure that the socket is connected.
		*/
		setTimeout(function() {
			self.ftsocket.sendMessage({action: "to_broadcast", infos: {message: "everyone_ready", content: opponent_infos}});
			self.gameFound(panel, self);
		}, 2000);
	},

	/**
	 *  Search for a normal game. If no one was found,
	 *  a new game will be create, otherwise the finded
	 *  game will be joined.
	 */
	findNormal: function()
	{
		var self = this.self;
		const panel = $("#game-panel");
		
		panel.html(`
			<h1>Searching for opponent...</h1>
			`);

			// Ask backend to get a game that doesn't have opponend.
			fetch(`http://localhost:3000/api/game/match_no_opponent`, {
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE'
				}
			})
				.then(response => response.json())
				.then(searchResult => {

					// Create new match if no one was found
					if (searchResult === null)
					{
						self.createNewGame(self, panel);
						return;
					}

					self.gameinfos = searchResult;

					// Join the finded game
					this.joinGame(self, panel);
			});
	},

	/**
	 * Render this page template.
	 */
	render: function () {
		this.$el.html(template);
	}
});
