/* User preview displayed in the top right corner. */
import Backbone from 'backbone';
import $, { event, uniqueSort } from 'jquery';
import { select } from 'underscore';

const state_enum = {
    "BEGIN": 1,
    "INGAME": 2,
    "END": 3,
    "DISCONNECTION": 4
};

export default Backbone.View.extend({
    el: "#game-canvas",

    /**
     * Initialization of this view.
     * @param {*} ftsocket the socket connected to the backend "game_room"
     * @param {*} gameinfos the informations about the game
     */
	initialize: function(ftsocket, gameinfos, connection_type)
	{
        // Base State.
        if (connection_type == "reconnection")
            this.state = state_enum["DISCONNECTION"];
        else
            this.state = state_enum["BEGIN"];

        // normal, reconnection, stream
        this.connection_type = connection_type;

        // Game id.
        this.game_id = gameinfos.id;

        // This ftsocket is the ftsocket given by "Game" view.
        this.ftsocket = ftsocket;

        // Here the player is this client.
        this.player_info = 
            (gameinfos.player.id == window.currentUser.attributes.id) 
                ? gameinfos.player : gameinfos.opponent;

        // Here the opponent is the opponent client.
        this.opponent_info = 
            (this.player_info == gameinfos.player) 
                ? gameinfos.opponent : gameinfos.player;

        // Begin State vars
        this.begin_date = new Date();
        this.prev_date = new Date();
        this.begin_count = 3;

        // Game loop interval
        var self = this;
        this.timer = setInterval(function(){
            self.game();
        }, 1000 / 30);
        
        this.render();
    },
    
    // Events
    events: { "mousemove": "mouseMoveHandler" },

    /**
     * Capture mouse mouvement on the canvas.
     * @param {event} event the event.
     */
    mouseMoveHandler: function (event)
    {
        if (self.state != state_enum["DISCONNECTION"])
        {
            // The canvas rectangle.
            let rect = this.canvas.getBoundingClientRect();

            // Player info. 
            var player = this.player_info.is;

            // Set player paddle y at mouse position.
            player.y = event.pageY - rect.top - player.height / 2;

            // Avoid the paddle to be outside of the canvas.
            if (event.pageY + player.height / 2 + 5 > rect.bottom)
                player.y = rect.height - player.height - 5;
            else if (event.pageY - player.height / 2 - 5 < rect.top)
                player.y = 5;

            // Send to other client the paddle position.
            this.ftsocket.sendMessage({
                action: "to_broadcast",
                infos: {
                    message: "update_y",
                    content: {
                        player_id: player.player.id,
                        y: player.y
            }}}, false);
        }
    },

    /**
     * Draw the net on the game canvas.
     */
	drawNet: function()
	{
		for (let i = 0; i <= this.canvas.height; i += 15)
			this.drawRect(this.net.x, this.net.y + i, this.net.width, this.net.height, this.net.color);
	},

    /**
     * Draw a rectangle on the game canvas.
     * @param {number} x the top-left x position of the rectangle.
     * @param {number} y the top-left y position of the rectangle.
     * @param {number} w the width of the rectangle.
     * @param {number} h the height of the rectangle.
     * @param {string} color the color of the rectangle.
     */
	drawRect: function(x,y,w,h,color)
	{
		this.context.fillStyle = color;
		this.context.fillRect(x,y,w,h);
	},

    /**
     * Draw a circle on the game canvas.
     * @param {number} x the x position of the middle of the circle.
     * @param {number} y the y position of the middle of the circle.
     * @param {number} r the radius of the circle.
     * @param {string} color the color of the circle.
     */
	drawCicle: function(x,y,r,color)
	{
		this.context.fillStyle = color;
		this.context.beginPath();
		this.context.arc(x,y,r, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fill();
	},

    /**
     * Draw a text on the game canvas.
     * @param {string} text the text to print.
     * @param {number} x the top-left x position of the text.
     * @param {number} y the top-left y position of the text.
     * @param {string} color the color of the text.
     */
	drawText: function(text,x,y,color)
	{
		this.context.fillStyle = color;
		this.context.font = "45px Western";
		this.context.fillText(text,x,y);
	},

    /**
     * Draw every objects of the game.
     */
	gameRender: function()
	{
        if (this.left && this.right && this.ball)
        {
            // Clear screen
            this.drawRect(0,0,this.canvas.width,this.canvas.height, "BLACK");

            // Draw the net.
            this.drawNet();

            // Draw score of each player
            this.drawText(this.left.score, this.canvas.width / 4, this.canvas.height / 5, "WHITE");
            this.drawText(this.right.score, (3 * this.canvas.width / 4) - 45, this.canvas.height / 5, "WHITE");
        
            // Draw players paddles
            this.drawRect(this.left.x, this.left.y, this.left.width, this.left.height, this.left.color);
            this.drawRect(this.right.x, this.right.y, this.right.width, this.right.height, this.right.color);

            // Draw the ball
            this.drawCicle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
        }
    },

    /**
     * Detect a collision between a player and 
     * the ball.
     * @param {ball} b the balle.
     * @param {player} p the player.
     * @returns true if a ball enter in collision 
     * with the player paddle, false otherwise.
     */
	collision: function(b, p)
	{
		b.top = b.y - b.radius;
		b.bottom = b.y + b.radius;
		b.left = b.x - b.radius;
		b.right = b.x + b.radius;

		p.top = p.y;
		p.bottom = p.y + p.height;
		p.left = p.x;
		p.right = p.x + p.width;

		return (b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom);
    },
    
    /**
     * Play a sound.
     * @param {string} sound_path the sound path.
     */
    playSound: function(sound_path)
    {
        var audio = new Audio(sound_path);
        audio.loop = false;
        audio.play();
    },

    /**
     * Reset ball position and speed. Invert the
     * ball velocity on X to push the ball toward the
     * last player to score.
     */
    resetBall: function()
    {
        // this.playSound('../../assets/game_sound/score.ogg');
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = 8;
        this.ball.velocityX = -this.ball.velocityX;
    },

    detectGoal: function()
    {
        // Detect if the ball is before the left player on the canvas.
        if (this.ball.x - this.ball.radius < 0)
        {
            // Right player score. Send a message to clients to update score.
            this.ftsocket.sendMessage({ 
                action: "to_broadcast", 
                infos: { 
                    message: "update_score", 
                    content: { 
                        side: "right", 
                        score: (this.right.score + 1)
            }}}, false);

            // Reset ball position.
            this.resetBall();

        } // Detect if the ball is after the right player on the canvas.
        else if (this.ball.x + this.ball.radius > this.canvas.width)
        {
            // Left player score. Send a message to clients to update score.
            this.ftsocket.sendMessage({
                action: "to_broadcast", 
                infos: { 
                    message: "update_score",
                    content: { 
                        side: "left", 
                        score: (this.left.score + 1)
            }}}, false);

            // Reset ball position.
            this.resetBall();

        }

        // Detect if a player win.
        if (this.left.score >= 11 || this.right.score >= 11)
            // Send a message to clients to change state to end state.
            this.ftsocket.sendMessage({
                action: "to_broadcast",
                infos: {
                    message: "update_state",
                    content: {
                        state: state_enum["END"]
            }}}, false);
    },

    /**
     * This function is only executed by the left player.
     * Like it's diffuclt to have the game AI on the backend
     * one of the player need to do the calculs.
     * 
     * Update ball position, check ball things in function
     * of it position.
     */
	gameUpdate: function()
	{
        var ball_update = JSON.parse(JSON.stringify(this.ball));

		ball_update.x += ball_update.velocityX;
		ball_update.y += ball_update.velocityY;
    
		// Ball hit top / bottom border
        if ((ball_update.y + ball_update.radius > this.canvas.height && ball_update.velocityY > 0)
            || (ball_update.y - ball_update.radius < 0 && ball_update.velocityY < 0))
        {
            // this.playSound('../../assets/game_sound/wall_hit.ogg');
            ball_update.velocityY = -ball_update.velocityY;
        }
	
		let player = (ball_update.x < this.canvas.width / 2) ? this.left : this.right;
    
        if (this.collision(ball_update, player))
        {
            // Where the ball hit the player
            let collidePoint = ball_update.y - (player.y + player.height / 2);

            // Normalization
            collidePoint = collidePoint / (player.height / 2);

            // Calcul rad angle 
            let angleRad = collidePoint * Math.PI / 4;

            // Direction of the ball when hit
            let dir = (ball_update.x < this.canvas.width / 2) ? 1 : -1;

            // Valocity x & Y
            ball_update.velocityX = dir * ball_update.speed * Math.cos(angleRad);
            ball_update.velocityY = ball_update.speed * Math.sin(angleRad);

            // Increase difficulty
            ball_update.speed += 0.1;
            // this.playSound('../../assets/game_sound/wall_hit.ogg');
        }

        // Send ball position to other clients.
        this.ftsocket.sendMessage({
            action: "to_broadcast",
            infos: {
                message: "update_ball",
                content: ball_update
        }}, false);

        // Set new position of the ball.
        this.ball = ball_update;

        // Detect goal.
        this.detectGoal();
    },

    /**
     * Three second at the begining of the game.
     * In deep this function is used to sync the two player 
     * first game frame with the left player.
     */
    begin: function()
    {
        // Background.
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;

        // Width of left/right player and of "vs" strings.
        var textWidthT = this.context.measureText(this.left.player.name);
        var textWidthV = this.context.measureText("vs");
        var textWidthM = this.context.measureText(this.right.player.name);

        // Draw left player name.
        this.drawText(this.left.player.name,
            (this.canvas.width / 2) - (textWidthT.width/2), // Position in x.
            this.canvas.height / 4, // Position in y.
            "WHITE"); // Color.

        // Draw "vs" string.
        this.drawText("vs",
            (this.canvas.width / 2) - (textWidthV.width/2),
            (this.canvas.height / 4) + 45,
            "WHITE");

        // Draw right player name.
        this.drawText(this.right.player.name,
            (this.canvas.width / 2) - (textWidthM.width/2),
            (this.canvas.height / 4) + 90,
            "WHITE");
        
        // Countdown. 
        var actual_date = new Date();
        var diff_time = Math.trunc((4000 - (actual_date - this.begin_date)) / 1000);
        
        // Detect of time before start is 0. Only executed by left player.
        if (diff_time == 0 && this.player_info.side == "left")
            // Update state to "in game" state.
            this.ftsocket.sendMessage({
                action: "to_broadcast",
                infos: {
                    message: "update_state",
                    content: {
                        state: state_enum["INGAME"]
            }}});
        else // Draw countdown.
            this.drawText(diff_time,
                (this.canvas.width / 2) - (this.context.measureText(diff_time + "").width / 2),
                (this.canvas.height - (this.canvas.height / 4)),
                "WHITE");
    },

    /**
     * End state. Draw match result.
     */
    end: function()
    {
        // Background.
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;
        
        // Get who is the winner / looser.
        var winner = (this.left.score >= 11) ? this.left : this.right;
        var looser = (winner == this.left) ? this.right : this.left;

        // End title.
        var end_title = winner.player.name + " win !"

        // Width of "end title", winner/looser score and of "-" strings.
        var textWidthWin = this.context.measureText(end_title);
        var textWidthWinScore = this.context.measureText(winner.score);
        var textWidthTil = this.context.measureText("-");
        var textWidthLosScore = this.context.measureText(looser.score);
        
        // Draw end title.
        this.drawText(end_title,
            (this.canvas.width / 2) - (textWidthWin.width/2),
            this.canvas.height / 4,
            "WHITE");
        
        // Draw winner score.
        this.drawText(winner.score,
            (this.canvas.width / 2) - (textWidthWinScore.width/2),
            this.canvas.height / 2.5,
            "WHITE");
        
        // Draw "-" string.
        this.drawText("-",
            (this.canvas.width / 2) - (textWidthTil.width/2),
            this.canvas.height / 2,
            "WHITE");
        
        // Draw looser score.
        this.drawText(looser.score,
            (this.canvas.width / 2) - (textWidthLosScore.width/2),
            (this.canvas.height / 2) + ((this.canvas.height / 2) - this.canvas.height / 2.5),
            "WHITE");
        
        // Stop game loop interval.
        clearInterval(this.timer);

        // Match history variable.
        this.match_history = {
            game_id: this.game_id,
            left: {
                player_id: this.left.id,
                player_name: this.left.name,
                score: this.left.score,
                status: ((this.left.score >= 11) ? "winner" : "looser")
            },
            right: {
                player_id: this.right.id,
                player_name: this.right.name,
                score: this.right.score,
                status: ((this.right.score >= 11) ? "winner" : "looser")
            }
        }

        // Return to "Direct game" menu.
        var self = this;
        setTimeout(function()
        {
            self.$el.trigger('end_game', self.match_history);
            self.off();
            self.remove();
        }, 3000);
    },

    disconnection: function()
    {
        // Background.
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;

        if (this.disconnect_values != null)
        {
            var text = "Player " + this.disconnect_values.display_name + " is disconnected...";
            var textWidth = this.context.measureText(text);
            this.drawText(text,
                (this.canvas.width / 2) - (textWidth.width/2),
                this.canvas.height / 4,
                "WHITE");
        }
    },

    /**
     * Game loop.
     */
	game: function()
	{
        switch (this.state) {

            // Begin state. begin().
            case state_enum["BEGIN"]:
                this.gameRender();
                this.begin();
                break;
            
            // End state. end().
            case state_enum["END"]:
                this.gameRender();
                this.end();
                break;
            
            // In game state. gameUpdate() , gameRender().
            case state_enum["INGAME"]:
                if (this.player_info.side == "left")
                    this.gameUpdate();
                this.gameRender();
                break;

            case state_enum["DISCONNECTION"]:
                this.gameRender();
                this.disconnection();
                break;

            default:
                break;
        }

	},

    /**
     * Treat messages from the socket to interact with the game.
     */
    messageTreatment: function(self)
    {
        this.ftsocket.socket.onmessage = function(event) {

            // Event variables.
            const event_res = event.data;
            const msg = JSON.parse(event_res);

            // Ignores pings.
            if (msg.type === "ping")
                return;

            if (msg.message)
            {
                // Update state.
                if (msg.message.message == "update_state")
                {
                    self.state = msg.message.content.state;
                    if (self.state == state_enum["BEGIN"])
                        self.begin_date = new Date();
                }
                else if (self.state != state_enum["DISCONNECTION"])
                {
                    // Update score.
                    if (msg.message.message == "update_score")
                    {
                        if (msg.message.content.side == "left")
                            self.left.score = msg.message.content.score;
                        else if (msg.message.content.side == "right")
                            self.right.score = msg.message.content.score;
                    }
                    // Update ball position.
                    else if (msg.message.message == "update_ball"
                        && self.player_info.side != "left")
                        self.ball = msg.message.content;
                    // Update opponent paddle position
                    else if (msg.message.message == "update_y"
                        && msg.message.content.player_id == self.opponent_info.id)
                            self.opponent_info.is.y = msg.message.content.y;
                    else if (msg.message.message == "client_quit")
                    {
                        self.state = state_enum["DISCONNECTION"];
                        self.disconnect_values = JSON.parse(msg.message.content);
                        self.messageTreatment(self);
                    }
                }
                else if (self.state == state_enum["DISCONNECTION"])
                {
                    if (msg.message.message == "need_infos"
                        && self.player_info
                        && msg.message.content.sender != self.player_info.id)
                    {
                        self.left.player.is = null;
                        self.right.player.is = null;
                        self.ftsocket.sendMessage({ 
                            action: "to_broadcast", 
                            infos: { 
                                message: "force_infos", 
                                content: { left: self.left, right: self.right, ball: self.ball }
                        }}, true, true);
                    }
                    else if (msg.message.message == "force_infos")
                    {
                        self.left = msg.message.content.left;
                        self.right = msg.message.content.right;
                        self.ball = msg.message.content.ball;

                        // Set the players sides to the players.
                        self.left.player.is = self.left;
                        self.right.player.is = self.right;

                        if (self.left.player.id == window.currentUser.attributes.id)
                        {
                            self.player_info.is = self.left;
                            self.opponent_info.is = self.right;
                        }
                        else if (self.right.player.id == window.currentUser.attributes.id)
                        {
                            self.player_info.is = self.right;
                            self.opponent_info.is = self.left;
                        }

                        if (self.player_info.id == self.left.player.id)
                        {
                            self.ftsocket.sendMessage({
                                action: "to_broadcast",
                                infos: {
                                    message: "update_state",
                                    content: {
                                        state: state_enum["BEGIN"]
                            }}}, true);
                        }
                    }
                }
            }
        };
    },

    render: function ()
    {
        var self = this;

        // Cavas elements.
        this.canvas = this.$el[0];
		this.context = this.canvas.getContext("2d");

        var left_player;
        var right_player;

        // Define left and right player.
        if (this.player_info.side == "left")
        {
            left_player = this.player_info;
            right_player = this.opponent_info;
        }
        else
        {
            left_player = this.opponent_info;
            right_player = this.player_info
        }

        if (this.connection_type == "normal")
        {
            // Init left player.
            this.left = {
                player: left_player,
                x: ((left_player.side == "left") ? 5 : this.canvas.width - 15),
                y: this.canvas.height/2 - 100/2,
                width: 10,
                height: 100,
                color: "WHITE",
                score: 0
            }

            // Init right player.
            this.right = {
                player: right_player,
                x: ((right_player.side == "left") ? 5 : this.canvas.width - 15),
                y: this.canvas.height/2 - 100/2,
                width: 10,
                height: 100,
                color: "WHITE",
                score: 0
            }

            // Init ball.
            this.ball = {
                x: this.canvas.width/2,
                y: this.canvas.height/2,
                radius: 10,
                speed: 8,
                velocityX: 5,
                velocityY: 0,
                color: "WHITE",
            }

            // Set the players sides to the players.
            this.left.player.is = this.left;
            this.right.player.is = this.right;

        }
        else if (this.connection_type == "reconnection")
        {
            this.ftsocket.sendMessage({ 
                action: "to_broadcast", 
                infos: { 
                    message: "need_infos",
                    content: { sender: this.player_info.id }
            }}, true, true);
        }
        
        // Init net.
		this.net = {
			x: (this.canvas.width / 2) - 1,
			y: 0,
			width: 2,
			height: 10,
			color: "WHITE"
        }
        
        // Setup message treatment.
        this.messageTreatment(self);
    }
});