/* The login page. */
import Backbone from 'backbone';
import Cookies from 'js-cookie';
import $ from 'jquery';

export default Backbone.View.extend({
	el: "#page",
	events: {
		'click #login-button': function () {
			const login = prompt("[Fake auth for now] Enter your login");
			if (login) {
				Cookies.set('user', login);
				window.location.hash = "/";
			}
		},
	},
	render: function () {
		let bubbles = "";
		for (let i = 0; i < 200; ++i) {
			const size = (2 + Math.random() * 5).toFixed(2);
			bubbles += `<div class="auth-bubble" style="top: ${(Math.random() * 100).toFixed(2)}%; left: ${(Math.random() * 100).toFixed(2)}%; width: ${size}px; height: ${size}px;"></div>`;
		}
		this.$el.html(
			`<div class="panel" id="auth-panel">
				<div>
					${bubbles}
					<img src="/assets/auth-illustration.svg" alt="Game illustration" />
				</div>
				<div>
					<h2>Login with your 42 account to continue</h2>
					<span class="button" id="login-button"><img src="/assets/42.svg" alt="School 42 logo"/>Log in</span>
				</div>
				<svg width="100" height="600" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 600">
					<g>
					<path id="svg_1" d="m48.5,-0.54688c1,0 -54,123.00001 -1,302.00001c53,179 1,300 0.5,299.54687c0.5,0.45313 -47.51042,0.45313 -48,0c0.49685,0 0.5,-601.54688 3,-601" stroke-width="0" stroke="#000" fill="#181a25"/>
					</g>
				</svg>
			</div>`
		);
	},
});