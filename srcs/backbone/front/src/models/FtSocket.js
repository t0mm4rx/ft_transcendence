/* The ftsocket model and collection. */
import Backbone from "backbone";

const FtSocket = Backbone.Model.extend({
  /**
   * Create a new socket between frontend (this)
   * and the backend (rails).
   *
   * @param {*} identifier the identifier parameters of the socket.
   * Need a 'channel' part at least.
   * (Used to setup the socket if the socket doesn"t exist).
   * (Exemple : {id: 33, channel: 'GameRoomChannel'} )
   */
  initialize: function (identifier) {
    var self = this;
    this.identifier = identifier;

    // Init a new socket to backend.
    // URL NEED TO BE CHANGED BY THE ACTUAL
    this.socket = new WebSocket("ws://0.0.0.0:3000/cable");

    // Connect client to identifier. (Please no overload)
    this.socket.onopen = function (event) {
      console.log("[FTS] Socket to " + identifier.channel + " is connected.");
      const msg = {
        command: "subscribe",
        identifier: JSON.stringify(identifier),
      };
      self.socket.send(JSON.stringify(msg));
    };

    // A message is received from the server. (Can be overloaded !)
    this.socket.onmessage = function (event) {
      const response = event.data;
      const msg = JSON.parse(response);

      // Ignores pings.
      if (msg.type === "ping") return;

      console.log("[FTS] Message from server : ", msg);
    };

    // Connection closed. (Can be overloaded !)
    this.socket.onclose = function (event) {
      console.log(
        "[FTS] Socket to " + identifier.channel + " is disconnected."
      );
    };

    // Error appear. (Can be overloaded !)
    this.socket.onerror = function (error) {
      console.log("[FTS] Error from " + identifier.channel + ":" + error);
    };
  },

  /**
   * Send a command of type 'message' to the backend
   * server.
   * @param {*} msg_data the data of the message to send.
   * (Exemple: {action: "pef", content: "Hi!"}
   *  Where : action = def "pef" in blabla_channel.rb
   *          content = the content).
   */
  sendMessage: function (msg_data, output) {
    if (output == true)
      console.log("[FTS] Send message : " + JSON.stringify(msg_data));

    const msg = {
      command: "message",
      identifier: JSON.stringify(this.identifier),
      data: JSON.stringify(msg_data),
    };

    this.socket.send(JSON.stringify(msg));
  },
});

const FtSocketCollection = Backbone.Collection.extend({});

export { FtSocket, FtSocketCollection };
