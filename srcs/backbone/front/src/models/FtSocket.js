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

    /**
     * Create a new socket between frontend (this)
     * and the backend (rails).
     * 
     * @param {*} identifier the identifier parameters of the socket.
     * Need a 'channel' part at least.
     * (Used to setup the socket if the socket doesn"t exist).
     * (Exemple : {id: 33, channel: 'GameRoomChannel'} )
     */
    initialize: function(identifier) 
    {
        var self = this;
        this.cansend = false;
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

        // Connect client to identifier. (Please no overload)
        this.socket.onopen = function(event) {
			const msg = {
				command: 'subscribe',
				identifier: JSON.stringify(identifier),
			};
            self.socket.send(JSON.stringify(msg));
			console.log('[FTS] Socket to ' + identifier.channel + ' is connected.');
            self.cansend = true;
        };
        
        // A message is received from the server. (Can be overloaded !)
		this.socket.onmessage = function(event) {  
            const response = event.data;
			const msg = JSON.parse(response);
			
			// Ignores pings.
			if (msg.type === "ping")
				return;
            
			console.log("[FTS] Message from server : ", msg);
        };

        // Connection closed. (Can be overloaded !)
        this.socket.onclose = function(event) {
            if (self.socket.readyState !== WebSocket.CLOSED) {
                const msg = {
                    command: 'unsubscribe',
                    identifier: JSON.stringify(identifier),
                };
                self.socket.send(JSON.stringify(msg));
            }

			console.log('[FTS] Socket to ' + identifier.channel + ' is disconnected.');
		};

    /**
     * Send a command of type 'message' to the backend
     * server. 
     * @param {json} msg_data the data of the message to send.
     * @param {boolean} output true is print output.
     * (Exemple: {action: "pef", content: "Hi!"}
     *  Where : action = def "pef" in blabla_channel.rb
     *          content = the content).
     */
    sendMessage: function(msg_data, output, waitco)
    {
        const msg = {
            command: 'message',
            identifier: JSON.stringify(this.identifier),
            data: JSON.stringify(msg_data)
        };

        var self = this;
        if (waitco == true)
        {
            this.waitForSocketConnection(self, function()
                { 
                if (output == true)
                    console.log("[FTS] Send message : " + JSON.stringify(msg_data));
                    self.socket.send(JSON.stringify(msg));
                });
        }
        else
            self.socket.send(JSON.stringify(msg));
        },

    /**
     * Close the connection of the socket.
     */
    closeConnection: function()
    {
        console.log("[FTS] Close socket connection.");
        this.socket.close();
    },

    waitForSocketConnection: function(self, callback)
    {
        setTimeout(
            function () {
                console.log("Cansend = ", self.cansend);
                if (self.cansend == true) {
                    if (callback != null){
                    callback();
                    }
                } else {
                    self.waitForSocketConnection(self, callback);
                }
    
            }, 5); // wait 5 milisecond for the connection...
    }

const FtSocketCollection = Backbone.Collection.extend({});

export { FtSocket, FtSocketCollection };
