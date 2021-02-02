/* The login page. */
import Backbone from 'backbone';
import Cookies from 'js-cookie';
import $ from 'jquery';
import toasts from '../utils/toasts';
import { User } from '../models/User';
import { loadCurrentUser, loadGuilds } from '../utils/globals';
import {showModal} from '../utils/modal';
import { Chat } from "../models/Chat";
import { Tournaments } from "../models/Tournaments";

export default Backbone.View.extend({
	initialize: function () {
		this.isAuthOpen = false;
		this.token = null;
		this.qr_image = () => `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=otpauth://totp/Transcendence?secret=${window.currentUser.get('otp_secret_key')}&issuer=Transcendence`;
		this.listenTo(window.currentUser, 'change', this.renderSignup);
	},
	el: "#page",
	events: {
		'click #login-button': function () {
			this.ask42Login();
		},
		'click #auth-go-button': function () {
			this.signup();
		},
		'click #auth-2fa-button': function () {
			this.check2fa();
			// Here we check if the 2fa is good
			// this.login(this.token);
		},
		'keyup #auth-2fa-inputs > input': function (event) {
			if ("0123456789".indexOf(event.originalEvent.key) === -1) {
				console.log("Block");
				event.stopPropagation();
			} else {
				if (event.currentTarget.value.length > 1)
				{
					if (event.currentTarget.nextElementSibling) {
						event.currentTarget.nextElementSibling.value = event.currentTarget.value[1];
					}
					event.currentTarget.value = event.currentTarget.value[0];
				}
				if (event.currentTarget.nextElementSibling)
					event.currentTarget.nextElementSibling.focus();
			}
		},
		'click #auth-2fa-show-qr': function () {
			showModal("Lost your access ?", `<div id="modal-qr"><span>Scan this qr code in Google Authenticator.</span><img src="${this.qr_image()}" /></div>`, () => true, () => true);
		},
		'change #2fa-input': function (event) {
			if (event.currentTarget.checked) {
				$("#auth-2fa-section").addClass("qr-code-open");
			} else {
				$("#auth-2fa-section").removeClass("qr-code-open");
			}
		}
	},
	render: function () {
		let bubbles = "";
		for (let i = 0; i < 200; ++i) {
			const size = (2 + Math.random() * 5).toFixed(2);
			bubbles += `<div class="auth-bubble" style="top: ${(Math.random() * 100).toFixed(2)}%; left: ${(Math.random() * 100).toFixed(2)}%; width: ${size}px; height: ${size}px;"></div>`;
		}
		this.$el.html(
			`<div class="panel" id="auth-panel-container">
				<div id="auth-panel">
					<div>
						${bubbles}
						<img src="/assets/auth-illustration.svg" alt="Game illustration" />
					</div>
					<div style="position: relative;">
						<div id="auth-open-overlay"><span>Authentification in progress...</span><img src="/assets/oval.svg"/></div>
						<h2>Login with your 42 account to continue</h2>
						<span class="button" id="login-button"><img src="/assets/42.svg" alt="School 42 logo"/>Log in</span>
					</div>
					<svg width="100" height="600" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 600">
						<g>
						<path id="svg_1" d="m48.5,-0.54688c1,0 -54,123.00001 -1,302.00001c53,179 1,300 0.5,299.54687c0.5,0.45313 -47.51042,0.45313 -48,0c0.49685,0 0.5,-601.54688 3,-601" stroke-width="0" stroke="#000" fill="#181a25"/>
						</g>
					</svg>
				</div>
				<div id="auth-register" class="auth-panel-secondary">
					
				</div>
				<div id="auth-2fa" class="auth-panel-secondary">
					<h2>Open the Google Authenticator app</h2>
					<div id="auth-2fa-inputs">
						<input type="text" id="auth-2fa-1" placeholder="0"/>
						<input type="text" id="auth-2fa-2" placeholder="1"/>
						<input type="text" id="auth-2fa-3" placeholder="2"/>
						<input type="text" id="auth-2fa-4" placeholder="3"/>
						<input type="text" id="auth-2fa-5" placeholder="4"/>
						<input type="text" id="auth-2fa-6" placeholder="5"/>
					</div>
					<!--<div id="auth-2fa-qr-wrapper">
						<div class="button-icon" id="auth-2fa-show-qr"><i class="fas fa-qrcode"></i></div>
					</div>-->
					<span class="button" id="auth-2fa-button">Go!</span>
				</div>
			</div>`
		);
		this.renderSignup();
	},
	renderSignup: function () {
		$("#auth-register").html(
			`<h2>Tell us more about yourself</h2>
			<div id="auth-register-card">
				<img src="${window.currentUser.get('avatar_url') || ""}" id="register-avatar"/>
				<div class="input-wrapper">
					<span>Display name</span>
					<input type="text" placeholder="AwesomeBob" id="display-name-input" />
				</div>
				<div class="checkbox-wrapper">
					<input type="checkbox" id="2fa-input" name="2fa-input">
					<label for="2fa-input">I want to use 2FA</label>
				</div>
				<div id="auth-2fa-section">
					<img src=${this.qr_image()} id="auth-qr-code" />
					<div id="qr-code-text"><span>Scan this QR code in Google Authenticator</span></div>
				</div>
				<span class="button" id="auth-go-button">Go!</span>
			</div>`
		);
	},
	toggleAuth: function() {
		if (this.isAuthOpen) {
			this.isAuthOpen = false;
			// $("#auth-open-overlay").css("display", "none");
			$("#auth-open-overlay").css("opacity", "0");
			$("#auth-open-overlay").css("pointer-events", "none");
		} else {
			this.isAuthOpen = true;
			// $("#auth-open-overlay").css("display", "flex");
			$("#auth-open-overlay").css("opacity", "1");
			$("#auth-open-overlay").css("pointer-events", "all");
		}
	},
	ask42Login: function () {
		let creation = null;
		const w = window.open("http://0.0.0.0:3000/api/logintra", "_blank", "width=500px,height=500px");
		window.addEventListener('message', event => {
			w.close();
			const params = new URLSearchParams("?" + event.data.params);
			if (!params.get("token") || !params.get("creation")) {
				toasts.notifyError("Cannot get the 42 API token.");
				return;
			}
			creation = eval(params.get("creation"));
			this.token = params.get("token");
		}); 
		this.toggleAuth();
		const check = setInterval(() => {
			if (w.closed) {
				this.toggleAuth();
				clearInterval(check);

				if (!this.token) {
					toasts.notifyError("The authentification process hasn't been completed.");
					return;
				}

				// We load the user
				Cookies.set('user', this.token);
				$(document).trigger('token_changed');
				loadCurrentUser(() => {
					// Scenario 1: first user connection, we show the register panel
					if (creation) {
						$("#auth-panel").addClass("auth-panel-open");
						$("#auth-register").addClass("auth-panel-open");
						return;
					}

					// Scenario 2: the user is already known but has 2FA activated
					if (!creation && !!window.currentUser.get('tfa')) {
						$("#auth-panel").addClass("auth-panel-open");
						$("#auth-2fa").addClass("auth-panel-open");
						return;
					}
					
					// Scenario 3: the user is already known and has no 2FA -> direct login
					if (!creation && !window.currentUser.get('tfa')) {
						Cookies.set('user', this.token);
						$(document).trigger('token_changed');
						this.login();
						return;
					}
				}, (data, state) => {
					if (state.status === 403) {
						toasts.notifyError("You have been banned from the website.");
					}
				  });
				Cookies.remove('user');
			}
		}, 100);
	},
	login: function () {
		Cookies.set('user', this.token);
		$(document).trigger("token_changed");
		loadCurrentUser();
		loadGuilds();
		window.chat = new Chat();
		window.tournaments = new Tournaments();
		window.location.hash = "/";
	},
	check2fa: function () {
		let code = "";
		for (let i = 1; i <= 6; ++i)
			code += $(`#auth-2fa-${i}`).val();
		if (code.length !== 6) {
			toasts.notifyError("The code is incomplete.");
			return;
		}
		$.ajax({
			url: 'http://localhost:3000/api/tfa/',
			type: 'get',
			data: `code=${code}`,
			success: () => {
				window.currentUser.setTFA();
				this.login();
			},
			error: () => {
				toasts.notifyError("The given code is incorrect.");
				document.querySelectorAll("#auth-2fa-inputs input").forEach(el => el.value = "");
			}
		})
	},
	signup: function () {
		const displayName = $("#display-name-input").val();
		const tfa = $("#2fa-input").is(':checked');
		console.log("Signup, 2fa:", tfa);
		if (displayName.length <= 0) {
			toasts.notifyError("The display name can't be empty.");
		} else {
			window.currentUser.save('username', displayName);
			if (!tfa) {
				this.login();
				toasts.notifySuccess("Your account has been created");
			} 
			else {
				$("#auth-register").removeClass("auth-panel-open");
				$("#auth-panel").addClass("auth-panel-open");
				$("#auth-2fa").addClass("auth-panel-open");
			}
		}
	}
});