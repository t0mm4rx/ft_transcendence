/* User preview displayed in the top right corner. */
import Backbone from 'backbone';
import $, { event, uniqueSort } from 'jquery';
import { select } from 'underscore';

const state_enum = {
    "BEGIN": 1,
    "INGAME": 2,
    "END": 3,
    "PAUSED": 4
};

export default Backbone.View.extend({
    el: "#game-canvas",

	initialize: function(ftsocket, gameinfos)
	{
        this.state = state_enum["BEGIN"];
        this.ftsocket = ftsocket;

        this.player_info = (gameinfos.player.id == window.currentUser.attributes.id) ? gameinfos.player : gameinfos.opponent;
        this.opponent_info = (this.player_info == gameinfos.player) ? gameinfos.opponent : gameinfos.player;

        // Begin State vars
        this.begin_date = new Date();
        this.prev_date = new Date();
        this.begin_count = 3;

        var self = this;
		this.timer = setInterval(function(){
			self.game();
        }, 1000 / 30);
        
        this.render();
    },
    
    events: { "mousemove": "mouseMoveHandler" },

	drawNet: function()
	{
		for (let i = 0; i <= this.canvas.height; i += 15)
			this.drawRect(this.net.x, this.net.y + i, this.net.width, this.net.height, this.net.color);
	},

	drawRect: function(x,y,w,h,color)
	{
		this.context.fillStyle = color;
		this.context.fillRect(x,y,w,h);
	},

	drawCicle: function(x,y,r,color)
	{
		this.context.fillStyle = color;
		this.context.beginPath();
		this.context.arc(x,y,r, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fill();
	},

	drawText: function(text,x,y,color)
	{
		this.context.fillStyle = color;
		this.context.font = "45px Western";
		this.context.fillText(text,x,y);
	},

	gameRender: function()
	{
        // Clear screen
		this.drawRect(0,0,this.canvas.width,this.canvas.height, "BLACK");

		this.drawNet();

        // Draw score
		this.drawText(this.left.score, this.canvas.width / 4, this.canvas.height / 5, "WHITE");
		this.drawText(this.right.score, (3 * this.canvas.width / 4) - 45, this.canvas.height / 5, "WHITE");
	
		this.drawRect(this.left.x, this.left.y, this.left.width, this.left.height, this.left.color);
		this.drawRect(this.right.x, this.right.y, this.right.width, this.right.height, this.right.color);

		this.drawCicle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
	},

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
    
    playSound: function(sound_path)
    {
        var audio = new Audio(sound_path);
        audio.loop = false;
        audio.play();
    },

    resetBall: function()
    {
        // this.playSound('../../assets/game_sound/score.ogg');
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = 8;
        this.ball.velocityX = -this.ball.velocityX;
    },

	gameUpdate: function()
	{
        var ball_update = JSON.parse(JSON.stringify(this.ball));
        // console.log("ball_update : ", ball_update);

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
            // ball_update.velocityX = -ball_update.velocityX;
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

        // console.log("PREV = ", this.ball);
        this.ftsocket.sendMessage({ action: "to_broadcast", infos: { message: "update_ball", content: ball_update }}, false);
        this.ball = ball_update;
        // console.log("NEXT = ", this.ball);

        // detect goal
        if (this.ball.x - this.ball.radius < 0)
        {
            // oppnent win
            this.ftsocket.sendMessage({ action: "to_broadcast", infos: { message: "update_score", content: { side: "right", score: (this.right.score + 1) }}});
            this.resetBall();
        }
        else if (this.ball.x + this.ball.radius > this.canvas.width)
        {
            this.ftsocket.sendMessage({ action: "to_broadcast", infos: { message: "update_score", content: { side: "left", score: (this.left.score + 1) }}});
            this.resetBall();
        }

        if (this.left.score >= 11 || this.right.score >= 11)
            this.ftsocket.sendMessage({ action: "to_broadcast", infos: { message: "update_state", content: { state: state_enum["END"] }}});
    },

    /**
     * Three second at the begining of the game.
     * In deep this function is used to sync the two player 
     * first game frame with the left player.
     */
    begin: function()
    {
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;

        var textWidthT = this.context.measureText(this.left.player.name);
        var textWidthV = this.context.measureText("vs");
        var textWidthM = this.context.measureText(this.right.player.name);

        this.drawText(this.left.player.name, (this.canvas.width / 2) - (textWidthT.width/2), this.canvas.height / 4, "WHITE");
        this.drawText("vs", (this.canvas.width / 2) - (textWidthV.width/2), (this.canvas.height / 4) + 45, "WHITE");
        this.drawText(this.right.player.name, (this.canvas.width / 2) - (textWidthM.width/2), (this.canvas.height / 4) + 90, "WHITE");
        
        var actual_date = new Date();
        var diff_time = Math.trunc((4000 - (actual_date - this.begin_date)) / 1000);
        
        if (diff_time == 0 && this.player_info.side == "left")
            this.ftsocket.sendMessage({ action: "to_broadcast", infos: { message: "update_state", content: { state: state_enum["INGAME"] }}});
        else
            this.drawText(diff_time, (this.canvas.width / 2) - (this.context.measureText(diff_time + "").width / 2), (this.canvas.height - (this.canvas.height / 4)), "WHITE");
    },

    end: function()
    {
        this.context.globalAlpha = 0.7;
        this.drawRect(0,0, this.canvas.width, this.canvas.height, "BLACK");
        this.context.globalAlpha = 1.0;
        
        var winner = (this.left.score >= 11) ? this.left : this.right;
        var looser = (winner == this.left) ? this.right : this.left;

        var end_title = winner.player.name + " win !"
        var textWidthWin = this.context.measureText(end_title);
        var textWidthWinScore = this.context.measureText(winner.score);
        var textWidthTil = this.context.measureText("-");
        var textWidthLosScore = this.context.measureText(looser.score);
        
        this.drawText(end_title, (this.canvas.width / 2) - (textWidthWin.width/2), this.canvas.height / 4, "WHITE");
        this.drawText(winner.score, (this.canvas.width / 2) - (textWidthWinScore.width/2), this.canvas.height / 2.5, "WHITE");
        this.drawText("-", (this.canvas.width / 2) - (textWidthTil.width/2), this.canvas.height / 2, "WHITE");
        this.drawText(looser.score, (this.canvas.width / 2) - (textWidthLosScore.width/2), (this.canvas.height / 2) + ((this.canvas.height / 2) - this.canvas.height / 2.5), "WHITE");
        
        clearInterval(this.timer);

        this.match_history = {
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

        var self = this;
        setTimeout(function()
        {
            self.$el.trigger('end_game', self.match_history);
            self.off();
            self.remove();
            // window.location.replace("/#home");
        }, 3000);
    },

	game: function()
	{
        switch (this.state) {
            case state_enum["BEGIN"]:
                this.gameRender();
                this.begin();
                break;
            case state_enum["END"]:
                this.gameRender();
                this.end();
                break;
            case state_enum["INGAME"]:
                if (this.player_info.side == "left")
                    this.gameUpdate();
                this.gameRender();
                break;
            default:
                break;
        }

	},

    // NE PREND PAS EN COMPTE LE PADDING
    // https://developer.mozilla.org/fr/docs/Web/API/Element/getBoundingClientRect
    mouseMoveHandler: function (event)
    {
        let rect = this.canvas.getBoundingClientRect();

        var player = this.player_info.is;

        player.y = event.pageY - rect.top - player.height / 2;
        if (event.pageY + player.height / 2 + 5 > rect.bottom)
            player.y = rect.height - player.height - 5;
        else if (event.pageY - player.height / 2 - 5 < rect.top)
            player.y = 5;

        // Send to opponent
        this.ftsocket.sendMessage({action: "to_broadcast", infos: {message: "update_y", content: {player_id: player.player.id, y: player.y}}}, false);
    },

    render: function ()
    {
        var self = this;

        this.canvas = this.$el[0];
		this.context = this.canvas.getContext("2d");

        var left_player;
        var right_player;

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

		this.left = {
            player: left_player,
			x: ((left_player.side == "left") ? 5 : this.canvas.width - 15),
			y: this.canvas.height/2 - 100/2,
			width: 10,
			height: 100,
			color: "WHITE",
			score: 0
		}

		this.right = {
            player: right_player,
			x: ((right_player.side == "left") ? 5 : this.canvas.width - 15),
			y: this.canvas.height/2 - 100/2,
			width: 10,
			height: 100,
			color: "WHITE",
			score: 0
        }
        
        this.left.player.is = this.left;
        this.right.player.is = this.right;

		this.ball = {
			x: this.canvas.width/2,
			y: this.canvas.height/2,
			radius: 10,
			speed: 8,
			velocityX: 5,
			velocityY: 0,
			color: "WHITE",
        }
        
		this.net = {
			x: (this.canvas.width / 2) - 1,
			y: 0,
			width: 2,
			height: 10,
			color: "WHITE"
        }
        
        console.log("PLAYER : ", this.player_info);
        console.log("OPPONENT : ", this.opponent_info);

        this.ftsocket.socket.onmessage = function(event) {  
            const event_res = event.data;

            const msg = JSON.parse(event_res);

            // Ignores pings.
            if (msg.type === "ping")
                return;

            if (msg.message)
            {
                if (msg.message.message == "update_state")
                    self.state = msg.message.content.state;
                else if (msg.message.message == "update_score")
                {
                    if (msg.message.content.side == "left")
                        self.left.score = msg.message.content.score;
                    else if (msg.message.content.side == "right")
                        self.right.score = msg.message.content.score;
                }
                else if (msg.message.message == "update_ball" && self.player_info.side != "left")
                    self.ball = msg.message.content;
                else if (msg.message.message == "update_y"
                    && msg.message.content.player_id == self.opponent_info.id)
                        self.opponent_info.is.y = msg.message.content.y;
            }
        };
    },
});