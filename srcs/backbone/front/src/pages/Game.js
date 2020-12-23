/* The game page. */
import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore'
import template from '../../templates/game.html';
import p5 from 'p5';
import {Game, GameCollection} from '../models/Game';
import GameCanvas from '../views/GameCanvas';

var status_enum = {
	SEARCH: 1,
	PLAY: 2,
	PAUSE: 3,
	END: 4
};

export default Backbone.View.extend({
	el: "#page",

	// initialize: function()
	// {
	// 	this.status = status_enum["SEARCH"];

	// 	var self = this;
	// 	this.timer = setInterval(function(){
	// 		self.game();
	// 	}, 1000 / 60);
	// },

	// events: {
	// 	'click #game-canvas': function()
	// 	{
	// 		console.log("MEH");
	// 	}
	// },

	// drawNet: function()
	// {
	// 	for (let i = 0; i <= this.canvas.height; i += 15)
	// 	{
	// 		this.drawRect(this.net.x, this.net.y + i, this.net.width, this.net.height, this.net.color);
	// 	}
	// },

	// drawRect: function(x,y,w,h,color)
	// {
	// 	this.context.fillStyle = color;
	// 	this.context.fillRect(x,y,w,h);
	// },

	// drawCicle: function(x,y,r,color)
	// {
	// 	this.context.fillStyle = color;
	// 	this.context.beginPath();
	// 	this.context.arc(x,y,r, 0, 2 * Math.PI, false);
	// 	this.context.closePath();
	// 	this.context.fill();
	// },

	// drawText: function(text,x,y,color)
	// {
	// 	this.context.fillStyle = color;
	// 	this.context.font = "45px fantasy";
	// 	this.context.fillText(text,x,y);
	// },

	// gameRender: function()
	// {
	// 	this.drawRect(0,0,this.canvas.width,this.canvas.height, "BLACK");

	// 	this.drawNet();

	// 	this.drawText(this.player.score, this.canvas.width / 4, this.canvas.height / 5, "WHITE");
	// 	this.drawText(this.opponent.score, (3 * this.canvas.width / 4) - 45, this.canvas.height / 5, "WHITE");
	
	// 	this.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color);
	// 	this.drawRect(this.opponent.x, this.opponent.y, this.opponent.width, this.opponent.height, this.opponent.color);

	// 	this.drawCicle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
	// },

	// collision: function(b, p)
	// {
	// 	b.top = b.y - b.radius;
	// 	b.bottom = b.y + b.radius;
	// 	b.left = b.x - b.radius;
	// 	b.right = b.x + b.radius;

	// 	p.top = p.y;
	// 	p.bottom = p.y + p.height;
	// 	p.left = p.x;
	// 	p.right = p.x + p.width;

	// 	return (b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom);

	// },

	// gameUpdate: function()
	// {
	// 	this.ball.x += this.ball.velocityX;
	// 	this.ball.y += this.ball.velocityY;

	// 	// Ball hit top/bottom border
	// 	if (this.ball.y + this.ball.radius > this.canvas.height
	// 		|| this.ball.y - this.ball.radius < 0)
	// 			// Invert Y velocity
	// 			this.ball.velocityY = -this.ball.velocityY;
	
	// 	let player = (this.ball.x < this.canvas / 2) ? this.player : this.opponent;
	// },

	// game: function()
	// {
	// 	this.gameUpdate();
	// 	this.gameRender();
	// },

	// keyAction: function(e)
	// {
	// 	console.log(e.keyCode);
	// },

	render: function () {
		this.$el.html(template);
		new GameCanvas().render();
	}

	// render: function () {
	// 	this.$el.html(template);

	// 	this.canvas = $("#game-canvas")[0];
	// 	this.context = this.canvas.getContext("2d");

	// 	this.player = {
	// 		x: 5,
	// 		y: this.canvas.height/2 - 100/2,
	// 		width: 10,
	// 		height: 100,
	// 		color: "WHITE",
	// 		score: 0
	// 	}

	// 	this.opponent = {
	// 		x: this.canvas.width - 15,
	// 		y: this.canvas.height/2 - 100/2,
	// 		width: 10,
	// 		height: 100,
	// 		color: "WHITE",
	// 		score: 0
	// 	}

	// 	this.ball = {
	// 		x: this.canvas.width/2,
	// 		y: this.canvas.height/2,
	// 		radius: 10,
	// 		speed: 5,
	// 		velocityX: 5,
	// 		velocityY: 5,
	// 		color: "WHITE",
	// 	}

	// 	this.net = {
	// 		x: (this.canvas.width / 2) - 1,
	// 		y: 0,
	// 		width: 2,
	// 		height: 10,
	// 		color: "WHITE"
	// 	}

	// 	this.canvas.addEventListener("keydown", function(evt)
	// 	{
	// 		alert(e.keyCode);
	// 	}, true);
	// 	// this.game();
	// },
	// close: function()
	// {
	// 	clearInterval(this.timer);
	// }
});
