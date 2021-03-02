/**
 * Game canvas, is the game engine of the pong.
 */

import Backbone from 'backbone';
import _ from 'underscore';
import { Game } from '../models/Game';

// States of the game.
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
        // normal, reconnection, live
        this.connection_type = connection_type;
        
        // Game id.
        this.game_id = gameinfos.id;
        this.game_model = new Game();

        // This ftsocket is the ftsocket given by "Game" view.
        this.ftsocket = ftsocket;

        if (connection_type != "live")
        {
            // Base State.
            if (connection_type == "reconnection")
                this.state = state_enum["DISCONNECTION"];
            else
                this.state = state_enum["BEGIN"];

            // Here the player is this client.
            this.player_info = 
                (gameinfos.player.id == window.currentUser.get('id')) 
                    ? gameinfos.player : gameinfos.opponent;

            // Here the opponent is the opponent client.
            this.opponent_info = 
                (this.player_info == gameinfos.player) 
                    ? gameinfos.opponent : gameinfos.player;

            // Begin State vars
            this.begin_date = new Date();
            this.prev_date = new Date();
            this.begin_count = 3;

        }
        else if (connection_type == "live")
        {
            this.player_info = gameinfos.player;
            this.opponent_info = gameinfos.opponent;
        }

        // Game loop interval
        var self = this;
        this.timer = setInterval(function(){
            self.game();
        }, 1000 / 30);

        this.render();
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
        // Player side left
        if (p.player.side === "left")
        {
            // The ball is passed by the "x" position of the left player.
            if (b.previous.x - b.radius >= p.x + p.width && b.x - b.radius <= p.x + p.width)
            {
                var percentAlong = (p.x - b.previous.x) / (b.x - b.previous.x);
                var yIntersection = percentAlong * (b.y - b.previous.y) + b.previous.y;

                // The "y" position of the ball when it in the "x" player hit box is in the "y" player hit box.
                if (yIntersection > p.y - b.radius
                    && yIntersection < p.y + p.height + b.radius)
                    return (yIntersection);
            }
        }

        // Player side right
        else
        {
            // The ball is passed by the "x" position of the right player.
            if (b.previous.x + b.radius <= p.x && b.x + b.radius >= p.x )
            {
                var percentAlong = (p.x + b.previous.x) / (b.x + b.previous.x);
                var yIntersection = percentAlong * (b.y - b.previous.y) + b.previous.y;

                // The "y" position of the ball when it in the "x" player hit box is in the "y" player hit box.
                if (yIntersection > p.y - b.radius
                    && yIntersection < p.y + p.height + b.radius)
                    return (yIntersection);
            }
        }

        // No collision.
        return (-1);
    },
    
    /**
     * Play a sound. (Can be usefull...)
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
        var ball_update = JSON.parse(JSON.stringify(this.ball));
        var velo_pos = false;
        if (ball_update.velocityX > 0)
            velo_pos = true;

        // this.playSound('../../assets/game_sound/score.ogg');
        ball_update.speed = 8;
        ball_update.x = this.canvas.width / 2;
        ball_update.y = this.canvas.height / 2;
        ball_update.velocityX = (velo_pos == false) ? -5 : 5;
        ball_update.velocityY = 0;

        // Send ball position to other clients.
        this.ftsocket.sendMessage({
            action: "to_broadcast",
            infos: {
                sender: window.currentUser.get('id'),
                message: "update_ball",
                content: ball_update
        }}, false);

        this.ball = ball_update;
    },

    /**
     * Detect if a player scored.
     */
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
            this.game_model.updateScore(this.game_id, this.left.score, this.right.score + 1);
            
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
            this.game_model.updateScore(this.game_id, this.left.score + 1, this.right.score);

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
        let colidY = this.collision(ball_update, player);
        if (colidY !== -1)
        {
            if (player.player.side == "left")
                ball_update.x = player.x + player.width + ball_update.radius;
            else
                ball_update.x = player.x - ball_update.radius;
            ball_update.y = colidY;
            
            // Increase difficulty
            if (ball_update.speed < 8)
                ball_update.speed = 8;
            ball_update.speed += 0.5;

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

            // this.playSound('../../assets/game_sound/wall_hit.ogg');
            let self = this;
            // Send ball position to other clients.
            if (window.currentUser.get('id') == player.player.id && self.connection_type !== "live")
                _.throttle(
                self.ftsocket.sendMessage({
                    action: "to_broadcast",
                    infos: {
                        sender: window.currentUser.get('id'),
                        message: "update_ball",
                        content: ball_update
                    }}, false), 250);
        }

        var to_give = JSON.parse(JSON.stringify(this.ball));
        to_give.previous = null;
        ball_update.previous = to_give;
        // Set new position of the ball.
        this.ball = ball_update;

        // Detect goal.
        if (window.currentUser.get('id') == player.player.id && self.connection_type !== "live")
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
        var textWidthT = this.context.measureText(this.left.player.username);
        var textWidthV = this.context.measureText("vs");
        var textWidthM = this.context.measureText(this.right.player.username);

        // Draw left player name.
        this.drawText(this.left.player.username,
            (this.canvas.width / 2) - (textWidthT.width/2), // Position in x.
            this.canvas.height / 4, // Position in y.
            "WHITE"); // Color.

        // Draw "vs" string.
        this.drawText("vs",
            (this.canvas.width / 2) - (textWidthV.width/2),
            (this.canvas.height / 4) + 45,
            "WHITE");

        // Draw right player name.
        this.drawText(this.right.player.username,
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
        var end_title = winner.player.username + " win !"

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
                player_name: this.left.username,
                score: this.left.score,
                status: ((this.left.score >= 11) ? "winner" : "looser")
            },
            right: {
                player_id: this.right.id,
                player_name: this.right.username,
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

    /**
     * Print disconnection message.
     */
    disconnection: function()
    {
        // Background.
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;

        if (this.disconnect_values != null)
        {
            var text_user = this.disconnect_values.display_name;
            var text_disco = " is disconnected...";
            var text_width_user = this.context.measureText(text_user);
            var text_width_disco = this.context.measureText(text_disco);
            this.drawText(text_user,
                (this.canvas.width / 2) - (text_width_user.width/2),
                this.canvas.height / 4,
                "WHITE");
            this.drawText(text_disco,
                (this.canvas.width / 2) - (text_width_disco.width/2),
                this.canvas.height / 2.5,
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
                // if (window.currentUser.get('id') == this.left.player.id)
                    this.gameRender();
                // if (window.currentUser.get('id') == this.left.player.id
                        this.gameUpdate();
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
        this.ftsocket.socket.onmessage = async function(event) {

            // Event variables.
            const event_res = event.data;
            const msg = JSON.parse(event_res);

            // Ignores pings.
            if (msg.type === "ping" || self.state == state_enum["END"])
                return;

            // The player is well connected to the game after a reconnection
            if (msg.type === "confirm_subscription"
                && self.connection_type === "reconnection")
            {
                // Ask infos
                self.ftsocket.sendMessage({ 
                    action: "to_broadcast", 
                    infos: {
                        sender: {
                            id: window.currentUser.get('id'),
                            connection_type: self.connection_type
                        },
                        message: "need_infos",
                        content: {}
                }}, true, true);
            }

            if (msg.message)
            {

                /**
                 * The sender of the message is the actual user
                 * and the message is "update_y" || "update_ball",
                 * but it's not a livestream connection, just return; 
                 */
                if ((msg.message.message === "update_y"
                    || msg.message.message === "update_ball")
                    && msg.message.sender == self.player_info.id
                    && self.connection_type != "live")
                    return;
                
                // Anyone isn't disconnected.
                else if (self.state != state_enum["DISCONNECTION"]
                    && (msg.message.message === "update_y"
                    || msg.message.message === "update_ball"))
                {

                    // Update opponent paddle position
                    if (msg.message.message == "update_y")
                    {
                        // It's not a livestream connection
                        if (self.connection_type != "live"
                            && msg.message.content.player_id == self.opponent_info.id)
                                self.opponent_info.is.y = msg.message.content.y;

                        // It's a livestream connection
                        else
                        {
                            if (self.left && msg.message.content.player_id == self.left.player.id)
                                self.left.y = msg.message.content.y;
                            else if (self.right && msg.message.content.player_id == self.right.player.id)
                                self.right.y = msg.message.content.y;
                        }
                    }

                    // Update ball position.
                    else if (msg.message.message == "update_ball" && self.ball)
                    {
                        let ball_side = (self.ball.x < self.canvas.width / 2) ? self.left : self.right;
                        if (ball_side.player.id == msg.message.sender || self.connection_type == "live")
                            self.ball = msg.message.content;
                        return;
                    }
                }

                // Update state.
                else if (msg.message.message == "update_state")
                {
                    self.state = msg.message.content.state;
                    if (self.state == state_enum["BEGIN"])
                        self.begin_date = new Date();
                }

                // Give back the informations of the game.
                else if (msg.message.message == "need_infos"
                    && self.connection_type == "normal")
                {

                    var left_values = {
                        player: {id: self.left.player.id, name: self.left.player.username},
                        x: self.left.x,
                        y: self.left.y,
                        width: self.left.width,
                        height: self.left.height,
                        color: self.left.color,
                        score: self.left.score
                    }

                    var right_values = {
                        player: {id: self.right.player.id, name: self.right.player.username},
                        x: self.right.x,
                        y: self.right.y,
                        width: self.right.width,
                        height: self.right.height,
                        color: self.right.color,
                        score: self.right.score
                    }

                    var ball_values = JSON.parse(JSON.stringify(self.ball));

                    // Send message to send infos.
                    self.ftsocket.sendMessage({ 
                        action: "to_broadcast", 
                        infos: {
                            sender: {id: window.currentUser.get('id'), connection_type: self.connection_type},
                            message: "force_infos", 
                            content: {
                                left: left_values,
                                right: right_values,
                                ball: ball_values,
                                state: self.state,
                                reply_to: msg.message.sender
                            }
                    }}, true, true);
                }

                /**
                 * Force to get and use the informations sended in the message.
                 * Work for a livestream or durring a disconnection (for a reconnection).
                 */
                else if (msg.message.message == "force_infos"
                    && (self.connection_type == "live"
                        || self.state == state_enum["DISCONNECTION"]))
                {
                    // The user is who asked for.
                    if (window.currentUser.get('id') == msg.message.content.reply_to.id)
                    {
                        self.left = msg.message.content.left;
                        self.right = msg.message.content.right;
                        self.ball = msg.message.content.ball;
                        self.state = msg.message.content.state;

                        self.left.player = window.users.where({id: self.left.player.id})[0].attributes;
                        self.right.player = window.users.where({id: self.right.player.id})[0].attributes;

                        // Set the players sides to the players.
                        self.left.player.is = self.left;
                        self.left.player.side = "left";
                        self.right.player.is = self.right;
                        self.right.player.side = "right";

                        if ((self.connection_type != "live"
                            && self.left.player.id == window.currentUser.get('id'))
                            || self.left.player.id == self.player_info.id)
                        {
                            self.player_info.is = self.left;
                            self.opponent_info.is = self.right;
                        }
                        else if ((self.connection_type != "live"
                            && self.right.player.id == window.currentUser.get('id'))
                            || self.right.player.id == self.opponent_info.id)
                        {
                            self.player_info.is = self.right;
                            self.opponent_info.is = self.left;
                        }
                    }

                    // If it's a player reset the game to begin state. (No change of scores)
                    if (window.currentUser.get('id') == self.left.player.id
                        && self.connection_type != "live"
                        && msg.message.content.reply_to.connection_type != "live"
                        && self.state == state_enum["DISCONNECTION"])
                    {
                        self.ftsocket.sendMessage({
                            action: "to_broadcast",
                            infos: {
                                message: "update_state",
                                content: {
                                    state: state_enum["BEGIN"]
                        }}}, true);
                    }
                    
                    if (self.connection_type == "reconnection")
                    {
                        self.connection_type = "normal";

                        self.ftsocket.sendMessage({
                            action: "reco_to_normal"
                        }, true);
                    }
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

                    // A client leave
                    else if (msg.message.message == "client_quit")
                    {
                        self.disconnect_values = JSON.parse(msg.message.content);
                        if (self.disconnect_values.connection_type == "normal")
                        {
                            self.state = state_enum["DISCONNECTION"];
                            self.messageTreatment(self);
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

        this.canvas.addEventListener('mousemove', function(evt) {
                    if (self.state != state_enum["DISCONNECTION"]
            && self.canvas && self.connection_type != "live")
            {

            // The canvas rectangle.
            let rect = self.canvas.getBoundingClientRect();

            // Player info. 
            var player = self.player_info.is;

            // Set player paddle y at mouse position.
            player.y = evt.clientY - rect.top - player.height / 2;

            // Avoid the paddle to be outside of the canvas.
            if (evt.clientY + player.height / 2 + 5 > rect.bottom)
                player.y = rect.height - player.height - 5;
            else if (evt.clientY - player.height / 2 - 5 < rect.top)
                player.y = 5;

            // Send to other client the paddle position.
            _.throttle(self.ftsocket.sendMessage({
                action: "to_broadcast",
                infos: {
                    sender: player.player.id,
                    message: "update_y",
                    content: {
                        player_id: player.player.id,
                        y: player.y
                }}}, false, false)
            , 40);
            }
        });

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

            this.ball.previous = {
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
        else if (this.connection_type != "normal")
        {
            this.ftsocket.sendMessage({ 
                action: "to_broadcast", 
                infos: {
                    sender: {id: window.currentUser.get('id'), connection_type: self.connection_type},
                    message: "need_infos",
                    content: {}
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
    },
});