/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guilds.html';
import _ from "underscore";

export default Backbone.View.extend({
	el: "#page",
	events: {
		"click .guild-item-clickable": function (evt) {
			const anagram = evt.currentTarget.getAttribute('anagram');
			window.location.hash = `guild/${anagram}/`;
		},
		"keydown #name-input": function (evt) {
			setTimeout(() => {
				$("#anagram-input").val(this.findAnagram());
			}, 20);
		},
		"keydown #anagram-input": function () {
			setTimeout(() => {
				let value = $("#anagram-input").val();
				value = value.toUpperCase();
				value = value.replace(/[^a-z]/gi, '');
				if (value.length > 5)
					value = value.substr(0, 5);
				$("#anagram-input").val(value)
			}, 20);
		},
		"click #guild-create-button": function () {
			window.guilds.save($("#name-input").val(), $("#anagram-input").val());
		}
	},
	initialize: function () {
		this.listenTo(window.guilds, 'add', this.renderGuildsList);
		this.listenTo(window.currentUser, 'change', this.render);
	},
	render: function () {
		this.$el.html(_.template(template)({
			isInGuild: !!window.currentUser.get('guild')
		}));
		this.renderGuildsList();
	},
	renderGuildsList: function () {
		const list = $("#guilds-listing");
		list.html();
		window.guilds.forEach(guild => {
			list.append(
				`<div class="guild-item">
					<span class="guild-item-clickable" anagram="${guild.get('anagram')}">${guild.get('anagram')}</span>
					<span class="guild-item-clickable" anagram="${guild.get('anagram')}">${guild.get('name')}</span>
					<span>${guild.get('score') ?? 0}</span>
				</div>`
			);
		});
	},
	findAnagram: function () {
		const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let value = $("#name-input").val();
		let anagram = "";
		value = value.replace(/[^a-z]/gi, '');
		if (value.length < 5)
		{
			for (let i = 0; i < 5; ++i) {
				anagram += alpha[parseInt(Math.floor(Math.random() * alpha.length))];
			}
			return anagram;
		}
		const parts = value.match(new RegExp(`.{1,${Math.floor(value.length / 5)}}`,'g'));
		for (let i = 0; i < 5; ++i) {
			let letter = parts[i][parseInt(Math.floor(Math.random() * parts[i].length))];
			letter = letter.toUpperCase();
			anagram += letter;
		}
		return anagram;
	}
});