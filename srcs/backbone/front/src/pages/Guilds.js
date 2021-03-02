/* The home page. */
import Backbone from 'backbone';
import $ from 'jquery';
import template from '../../templates/guilds.html';
import _ from "underscore";
import flatpickr from "flatpickr";
import toasts from '../utils/toasts';
import { Guild } from '../models/Guild';

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
		},
		"click #guild-war-button": function () {
			this.declareWar();
		},
		"click #wt_game_invite": function ()
		{
			var guild = new Guild(window.currentUser.get('guild'));
			guild.gameWarInvite();
		}
	},
	initialize: function () {
		this.listenTo(window.guilds, 'add', this.renderGuildsList);
		this.listenTo(window.currentUser, 'change', this.render);
		this.listenTo(window.wars, 'add', this.render);
	},
	render: function () {

		let war = null;
		let guild1 = null;
		let guild2 = null;

		const isInWar = !!window.currentUser.get('guild') && !!window.currentUser.get('guild').isinwar;

		if (isInWar) {
			war = window.wars.models.find(a => a.get('id') === window.currentUser.get('guild').present_war_id);
			if (war) {
				guild1 = window.guilds.find(a => a.get('id') === war.get('guild1_id'));
				guild2 = window.guilds.find(a => a.get('id') === war.get('guild2_id'));
			}
		}

		this.$el.html(_.template(template)({
			isInGuild: !!window.currentUser.get('guild'),
			isInWar: isInWar,
			war: war,
			guild1: guild1,
			guild2: guild2,
		}));
		this.renderGuildsList();
		if (document.querySelector("#war-start-date")) {
			this.warStart = flatpickr(document.querySelector("#war-start-date"), {
				onChange: a => {
					if (this.warEnd)
						this.warEnd.set('minDate', a[0]);
					if (this.warTimeStart)
						this.warTimeStart.set('minDate', a[0]);
					if (this.warTimeEnd)
						this.warTimeEnd.set('minDate', a[0]);
				},
				minDate: new Date(),
				enableTime: true
			});
		}
		if (document.querySelector("#war-end-date")) {
			this.warEnd = flatpickr(document.querySelector("#war-end-date"), {
				onChange: a => {
					if (this.warTimeStart)
						this.warTimeStart.set('maxDate', a[0]);
					if (this.warTimeEnd)
						this.warTimeEnd.set('maxDate', a[0]);
				},
				minDate: new Date(),
				enableTime: true
			});
		}
		if (document.querySelector("#war-time-start")) {
			this.warTimeStart = flatpickr(document.querySelector("#war-time-start"), {
				onChange: a => {
					if (this.warTimeEnd)
						this.warTimeEnd.set('minDate', a[0]);
				},
				minDate: new Date(),
				enableTime: true
			});
		}
		if (document.querySelector("#war-time-end")) {
			this.warTimeEnd = flatpickr(document.querySelector("#war-time-end"), {enableTime: true});
		}
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
	},
	declareWar: function () {
		const opponent = document.querySelector("#anagram-input").value;
		const stake = document.querySelector("#stake-input").value;
		let max = parseInt(document.querySelector("#max-input").value);
		const start = document.querySelector("#war-start-date").value;
		const end = document.querySelector("#war-end-date").value;
		const wtStart = document.querySelector("#war-time-start").value;
		const wtEnd = document.querySelector("#war-time-end").value;
		const allGamesCount = document.querySelector("#all-games-count").checked;
		const timeToAnswer = document.querySelector("#time-to-answer-input").value;
		if (!opponent || !guilds.models.find(a => a.get('anagram') === opponent)) {
			toasts.notifyError("Opponent's anagram not found.");
			return;
		}
		if (opponent === window.currentUser.get('guild').anagram) {
			toasts.notifyError("You cannot declare war to yourself!");
			return;
		}
		if (!stake) {
			toasts.notifyError("Stake cannot be empty.");
			return;
		}
		if (!max) {
			max = -1;
		}
		if (!start || !end || !wtStart || !wtEnd) {
			toasts.notifyError("Dates cannot be empty.");
			return;
		}
		guilds.models.find(a => a.get('anagram') === opponent).declareWar({
			'start_date': start,
			'end_date': end,
			'wt_start': wtStart,
			'wt_end': wtEnd,
			'wt_max_unanswers': max,
			'prize': stake,
			'add_count_all': allGamesCount,
			'wt_time_to_answer': !!timeToAnswer ? parseInt(timeToAnswer) : 1
		}, () => {
			document.querySelector("#anagram-input").value = "";
			document.querySelector("#stake-input").value = "";
			document.querySelector("#max-input").value = "";
			document.querySelector("#war-start-date").value = "";
			document.querySelector("#war-end-date").value = "";
			document.querySelector("#war-time-start").value = "";
			document.querySelector("#war-time-end").value = "";
			document.querySelector("#time-to-answer-input").value = "";
		});
	}
});