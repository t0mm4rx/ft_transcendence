/* User preview displayed in the top right corner. */
import Backbone from 'backbone';
import $, { event, uniqueSort } from 'jquery';

var status_enum = {
	SEARCH: 1,
	PLAY: 2,
	PAUSE: 3,
	END: 4
};

export default Backbone.View.extend({
    el: "#game-canvas",

	initialize: function()
	{
		this.status = status_enum["SEARCH"];

		var self = this;
		this.timer = setInterval(function(){
			self.game();
		}, 1000 / 60);
    },
    
    events: {
        "mousemove": "mouseMoveHandler"
    },

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
		this.context.font = "45px fantasy";
		this.context.fillText(text,x,y);
	},

	gameRender: function()
	{
		this.drawRect(0,0,this.canvas.width,this.canvas.height, "BLACK");

		this.drawNet();

		this.drawText(this.player.score, this.canvas.width / 4, this.canvas.height / 5, "WHITE");
		this.drawText(this.opponent.score, (3 * this.canvas.width / 4) - 45, this.canvas.height / 5, "WHITE");
	
		this.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color);
		this.drawRect(this.opponent.x, this.opponent.y, this.opponent.width, this.opponent.height, this.opponent.color);

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
    
    resetBall: function()
    {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = 5;
        this.ball.velocityX = -this.ball.velocityX;
    },

	gameUpdate: function()
	{
		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;

        this.opponent.y += (this.ball.y - (this.opponent.y + this.opponent.height / 2)) * 1.8;
    
		// Ball hit top/bottom border
		if (this.ball.y + this.ball.radius > this.canvas.height
			|| this.ball.y - this.ball.radius < 0)
				// Invert Y velocity
				this.ball.velocityY = -this.ball.velocityY;
	
		let player = (this.ball.x < this.canvas.width / 2) ? this.player : this.opponent;
    
        if (this.collision(this.ball, player))
        {
            // this.ball.velocityX = -this.ball.velocityX;
            // Where the ball hit the player
            let collidePoint = this.ball.y - (player.y + player.height / 2);

            // Normalization
            collidePoint = collidePoint / (player.height / 2);

            // Calcul rad angle 
            let angleRad = collidePoint * Math.PI / 4;

            // Direction of the ball when hit
            let dir = (this.ball.x < this.canvas.width / 2) ? 1 : -1;

            // Valocity x & Y
            this.ball.velocityX = dir * this.ball.speed * Math.cos(angleRad);
            this.ball.velocityY = this.ball.speed * Math.sin(angleRad);

            // Increase difficulty
            this.ball.speed += 0.1;
        }

        // detect goal
        if (this.ball.x - this.ball.radius < 0)
        {
            // oppnent win
            this.opponent.score++;
            this.resetBall();
        }
        else if (this.ball.x + this.ball.radius > this.canvas.width)
        {
            this.player.score++;
            this.resetBall();
        }
    },

	game: function()
	{
		this.gameUpdate();
		this.gameRender();
	},

    // NE PREND PAS EN COMPTE LE PADDING
    // https://developer.mozilla.org/fr/docs/Web/API/Element/getBoundingClientRect
    mouseMoveHandler: function (event)
    {
        let rect = this.canvas.getBoundingClientRect();

        console.log(rect.y / rect.bottom);
        console.log(event.pageY);
        // console.log(event.pageY - rect.top - this.player.height / 2);
        // console.log(rect.bottom - rect.top - 25 - this.player.height);
        this.player.y = event.pageY - rect.top - this.player.height / 2;
        if (event.pageY + this.player.height / 2 + 5 > rect.bottom)
            this.player.y = rect.height - this.player.height - 5;
        else if (event.pageY - this.player.height / 2 - 5 < rect.top)
            this.player.y = 5;
    },

	render: function () {

        this.canvas = this.$el[0];
		this.context = this.canvas.getContext("2d");

		this.player = {
			x: 5,
			y: this.canvas.height/2 - 100/2,
			width: 10,
			height: 100,
			color: "WHITE",
			score: 0
		}

		this.opponent = {
			x: this.canvas.width - 15,
			y: this.canvas.height/2 - 100/2,
			width: 10,
			height: 100,
			color: "WHITE",
			score: 0
		}

		this.ball = {
			x: this.canvas.width/2,
			y: this.canvas.height/2,
			radius: 10,
			speed: 5,
			velocityX: 5,
			velocityY: 5,
			color: "WHITE",
		}

		this.net = {
			x: (this.canvas.width / 2) - 1,
			y: 0,
			width: 2,
			height: 10,
			color: "WHITE"
		}

		// this.canvas.on("mousemove", this.mouseMoveHandler.bind(this));

		// this.game();
	}
});