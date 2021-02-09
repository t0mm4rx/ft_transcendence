/* The game page. */
import Backbone, { View } from "backbone";
import $ from "jquery";
import _, { create } from "underscore";
import template from "../../templates/game.html";
import { Game, GameCollection } from "../models/Game";
import GameCanvas from "../views/GameCanvas";
import { FtSocket } from "../models/FtSocket";
import { generateUUID } from "../utils/uuid";

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
  initialize: function () {
    this.listenTo(window.currentUser, "change", this.render);
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
    "click #game-normal": function () {
      this.findNormal();
    },
    "click #game-ranked": function () {
      console.log("CLICK GAME RANKED");

      window.currentUser.findLadderGame();
    },
    "click #change-user": function () {
      window.currentUser.set({ id: 589, username: "Mathis" });
    },
    end_game: function (event, info) {
      // Get actual informations about the game
      fetch(
        `http://` +
          window.location.hostname +
          `:3000/api/game_rooms/` +
          info.game_id,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
          },
        }
      )
        .then((response) => response.json())
        .then((searchResult) => {
          // Update game data on backend part
          fetch(
            `http://` +
              window.location.hostname +
              `:3000/api/game_rooms/` +
              info.game_id,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization:
                  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
              },
              body: JSON.stringify({
                player: searchResult.player,
                opponent: searchResult.opponent,
                status: "ended",
                number_player: 0,
              }),
            }
          );
        });

      this.ftsocket.closeConnection();
      this.$el.html(template);
    },
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
  startGame: function (panel, self, connection_type) {
    panel.html(
      `
			<div id="game-canvas-div">
				<div class="top-part">
				<div class="top-text" id="left-player">
					<h3>` +
        self.gameinfos.player.name +
        `</h3>
				</div>
				<div class="top-text" id="vs">
					<h3>vs</h3>
				</div>
				<div class="top-text" id="right-player">
					<h3>` +
        self.gameinfos.opponent.name +
        `</h3>
				</div>
			</div>
			<canvas id="game-canvas" width="600" height="400"></canvas>
			</div>
		`
    );

    self.gameinfos.player.side = "left";
    self.gameinfos.opponent.side = "right";

    self.game = new GameCanvas(self.ftsocket, self.gameinfos, connection_type);
  },

  /**
   *  Change panel to display that a game was found.
   *  Show players names. Wait a little bit "for the show".
   *
   * @param {*} panel the game panel element (#game-panel)
   * @param {*} self this view, given because this function
   * is used "asyncly".
   */
  gameFound: function (panel, self) {
    panel.html(
      `
			<div class="panel opponent-found">
				<h1 class="panel-header">Oppenent found !</h1>
				<h3 class="panel-header">` +
        self.gameinfos.player.name +
        ` vs ` +
        self.gameinfos.opponent.name +
        `</h3>
			</div>`
    );

    // Wait 3 secondes to "start", for the show.
    var show = setTimeout(function () {
      console.log("Start normal game");
      self.startGame(panel, self, "normal");
    }, 3000);

    self.ftsocket.socket.onmessage = function (event) {
      const event_res = event.data;
      const msg = JSON.parse(event_res);

      // Ignores pings.
      if (msg.type === "ping") return;

      if (msg.message && msg.message.message == "client_quit") {
        clearTimeout(show);

        // Get actual informations about the game
        fetch(
          `http://` +
            window.location.hostname +
            `:3000/api/game_rooms/` +
            self.gameinfos.id,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
            },
          }
        )
          .then((response) => response.json())
          .then((searchResult) => {
            // Update game data on backend part
            fetch(
              `http://` +
                window.location.hostname +
                `:3000/api/game_rooms/` +
                self.gameinfos.id,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization:
                    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
                },
                body: JSON.stringify({
                  player: searchResult.player,
                  opponent: searchResult.opponent,
                  status: "ended",
                  number_player: searchResult.number_player,
                }),
              }
            );
          });

        panel.html(
          `
					<h1>Player ` +
            JSON.parse(msg.message.content).display_name +
            ` disconnected ...</h1>`
        );

        self.ftsocket.closeConnection();
        setTimeout(function () {
          self.findNormal();
        }, 2000);
      }
    };
  },

  waitOpponent: function (self, panel, game_infos) {
    // Create new socket between frontend and backend
    self.ftsocket = new FtSocket({
      id: game_infos.id,
      channel: "GameRoomChannel",
      connect_type: "normal",
    });

    self.ftsocket.sendMessage(
      {
        action: "whoami",
        infos: {
          player_id: window.currentUser.get("id"),
          display_name: window.currentUser.get("username"),
        },
      },
      true,
      true
    );

    /*
     * Setup the socket to catch "everyone_ready" message to
     * start the game.
     */
    self.ftsocket.socket.onmessage = function (event) {
      const event_res = event.data;
      const msg = JSON.parse(event_res);

      // Ignores pings.
      if (msg.type === "ping") return;

      if (msg.type === "confirm_subscription" || msg.type === "welcome") {
        self.ftsocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              sender: {
                id: window.currentUser.get("id"),
                name: window.currentUser.get("username"),
                connection_type: "normal",
                uuid: self.uuid,
              },
              message: "amipresent",
              content: {},
            },
          },
          true,
          true
        );
        return;
      }

      console.log("Message : ", msg);
      if (msg.message) {
        if (msg.message.message == "everyone_ready") {
          // Get opponent informations
          self.gameinfos.opponent = msg.message.content;

          // "Start" the game for this client.
          self.gameFound(panel, self);
        } else if (msg.message.message == "amipresent") {
          if (
            msg.message.sender.id == window.currentUser.get("id") &&
            msg.message.sender.connection_type != "live" &&
            msg.message.sender.uuid != self.uuid
          ) {
            self.ftsocket.sendMessage(
              {
                action: "to_broadcast",
                infos: {
                  message: "youcantbehere",
                  content: { reply_to: msg.message.sender },
                },
              },
              true,
              true
            );
          }
        } else if (
          msg.message.message == "youcantbehere" &&
          msg.message.content.reply_to.uuid == self.uuid
        ) {
          self.ftsocket.closeConnection();
          self.$el.html(template);
        }
      }
    };
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
  createNewGame: function (self, panel) {
    // /!\ To change to be the actual url
    // Ask the backend to create the "game_room".
    fetch(`http://` + window.location.hostname + `:3000/api/game_rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
      },
      body: JSON.stringify({
        player: JSON.stringify({
          name: window.currentUser.get("username"),
          id: window.currentUser.get("id"),
        }),
        opponent: "",
        status: "notstarted",
        number_player: 0,
      }),
    })
      .then((res) => res.json())
      .then((createResult) => {
        self.gameinfos = createResult;

        // Get "player" (game creator, this client) informations.
        self.gameinfos.player = JSON.parse(self.gameinfos.player);

        // Wait opponent.
        this.waitOpponent(self, panel, createResult);
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
  joinGame: function (self, panel) {
    /*
     * Setup the informations about the opponent
     * (this client because it joining).
     */
    var opponent_infos = {
      name: window.currentUser.get("username"),
      id: window.currentUser.get("id"),
    };

    /*
     * Add "player" (other client) & "opponent" (this client)
     * to the game informations
     */
    self.gameinfos.player = JSON.parse(self.gameinfos.player);
    self.gameinfos.opponent = opponent_infos;

    // Update game data on backend part
    fetch(
      `http://` +
        window.location.hostname +
        `:3000/api/game_rooms/` +
        self.gameinfos.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
        },
        body: JSON.stringify({
          status: "active",
        }),
      }
    );

    // Connect this client to the "game_room" socket.
    self.ftsocket = new FtSocket({
      id: self.gameinfos.id,
      channel: "GameRoomChannel",
      connect_type: "normal",
    });

    self.ftsocket.socket.onmessage = function (event) {
      const event_res = event.data;
      const msg = JSON.parse(event_res);

      // Ignores pings.
      if (msg.type === "ping") return;

      if (msg.type === "welcome" || msg.type === "confirm_subscription") {
        self.ftsocket.sendMessage(
          {
            action: "whoami",
            infos: {
              player_id: window.currentUser.get("id"),
              display_name: window.currentUser.get("username"),
            },
          },
          true,
          true
        );

        /*
         * Send the "everyone_ready" message to the "player" (other client).
         * "Start" the game for this client. Executed after 2 secondes to be
         * sure that the socket is connected (and for the show).
         */
        setTimeout(function () {
          self.ftsocket.sendMessage({
            action: "to_broadcast",
            infos: {
              message: "everyone_ready",
              content: opponent_infos,
            },
          });

          self.gameFound(panel, self);
        }, 2000);
      }
    };
  },

  /**
   * Detect if the player is diconnected
   * of a game.
   * @param {view} self the view.
   * @returns true if the player was disconnected,
   * in this case, the gameinfos has resetup with the
   * content of the database, false otherwise.
   */
  isDisconnected: async function (self) {
    // This player informations.
    var this_player = {
      name: window.currentUser.get("username"),
      id: window.currentUser.get("id"),
    };

    // Return value.
    var is_disco = true;

    // Request to the backend.
    await fetch(
      `http://` + window.location.hostname + `:3000/api/game/is_disconnected`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
        },
        body: JSON.stringify({
          player: JSON.stringify(this_player),
        }),
      }
    )
      .then((response) => response.json())
      .then((searchResult) => {
        // Check the response of the backend.
        if (searchResult == null) is_disco = false;
        // Resetup game values
        else {
          is_disco = true;
          self.gameinfos = searchResult;

          self.gameinfos.player = JSON.parse(self.gameinfos.player);

          if (self.gameinfos.opponent !== "")
            self.gameinfos.opponent = JSON.parse(self.gameinfos.opponent);
        }
      });

    return is_disco;
  },

  reconnection: function (self, panel) {
    // Create new socket between frontend and backend
    self.ftsocket = new FtSocket({
      id: self.gameinfos.id,
      channel: "GameRoomChannel",
      connect_type: "reconnection",
    });

    self.ftsocket.sendMessage(
      {
        action: "whoami",
        infos: {
          player_id: window.currentUser.get("id"),
          display_name: window.currentUser.get("username"),
        },
      },
      true,
      true
    );

    var timeout = setTimeout(function () {
      self.startGame(panel, self, "reconnection");
    }, 2000);

    /*
     * Setup the socket to catch "everyone_ready" message to
     * start the game.
     */
    self.ftsocket.socket.onmessage = function (event) {
      const event_res = event.data;
      const msg = JSON.parse(event_res);

      // Ignores pings.
      if (msg.type === "ping") return;

      if (msg.type === "confirm_subscription" || msg.type === "welcome") {
        self.ftsocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              sender: {
                id: window.currentUser.get("id"),
                name: window.currentUser.get("username"),
                connection_type: "normal",
                uuid: self.uuid,
              },
              message: "amipresent",
              content: {},
            },
          },
          true,
          true
        );
        return;
      }

      console.log("Message : ", msg);
      if (msg.message) {
        if (msg.message.message == "amipresent") {
          if (
            msg.message.sender.id == window.currentUser.get("id") &&
            msg.message.sender.connection_type != "live" &&
            msg.message.sender.uuid != self.uuid
          ) {
            self.ftsocket.sendMessage(
              {
                action: "to_broadcast",
                infos: {
                  message: "youcantbehere",
                  content: { reply_to: msg.message.sender },
                },
              },
              true,
              true
            );
          }
        } else if (
          msg.message.message == "youcantbehere" &&
          msg.message.content.reply_to.uuid == self.uuid
        ) {
          clearInterval(timeout);
          self.ftsocket.closeConnection();
          self.$el.html(template);
        }
      }
    };
  },

  /**
   *  Search for a normal game. If no one was found,
   *  a new game will be create, otherwise the finded
   *  game will be joined.
   */
  findNormal: async function () {
    var self = this.self;
    const panel = $("#game-panel");

    panel.css("width", "initial");
    panel.css("height", "initial");
    panel.css("text_align", "initial");

    panel.html(`
			<div class="panel">
				<h1 class="panel-header">Searching for opponent...</h1>
			</div>
		`);

    var disco = await this.isDisconnected(self);
    if (disco == true) {
      console.log("Game infos = ", self.gameinfos);
      if (self.gameinfos.status == "notstarted")
        this.waitOpponent(self, panel, self.gameinfos);
      else if (self.gameinfos.status == "active")
        this.reconnection(self, panel);
      return;
    }

    // Ask backend to get a game that doesn't have opponend.
    fetch(
      `http://` + window.location.hostname + `:3000/api/game/match_no_opponent`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTIzODU0OTZ9.dAqdnhASc-Ozc89CqvB0kksQ3BJx37fvVEZwiSKYgLE",
        },
      }
    )
      .then((response) => response.json())
      .then((searchResult) => {
        // Create new match if no one was found
        if (searchResult === null) {
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
    if (window.currentUser.get("login")) {
      this.self = this;
      this.uuid = generateUUID();
      this.$el.html(template);
    }
  },
});
