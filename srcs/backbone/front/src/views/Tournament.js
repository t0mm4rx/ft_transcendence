import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

export default Backbone.View.extend({
  template: _.template(
    `<% if (registrationOpen) { 
      %><div id="tournament-badge"><div class="register-overlay"></div><%= (model.get("registered") == true) ? "Unregister" : "Register" %></div><% 
    } %>
    <div class="current-tournament" id="information">
    <h1><%= model.escape("name") %></h1>
    <i id="img1" class="tournament-symbol fas fa-child"></i>
    <i id="img2" class="tournament-symbol fas fa-hourglass-half"></i>
    <i id="img3" class="tournament-symbol fas fa-award"></i>
    <span id="players">players:</span><h3 id="players"><%= model.get("users").length %></h3>
    <span id="time"><%= timeTitle %>:</span><h3 id="time"><%= (new Date(model.escape(timeTitle).replace(/-/g, "/"))).toLocaleString(
      "en-US",
      {
        month: "numeric",
        day: "numeric",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }
    ) %></h3>
    <span id="prize">title: </span><h3 id="prize">SMASHER</h3>
  </div>
  <div class="current-tournament" id="ranking"></div>
  <div class="current-tournament" id="games"></div>`
  ),
  userTemplate: _.template(
    `<div class="tournament-item"><% if (rank) {%> <span class="rank"><%= rank %>. </span><%} %>
    <a href="/#user/<%= model.login %>/"><img class="tournament-avatar" src="<%= model.avatar_url %>" /></a><span><%= model.username %></span>
    </div>`
  ),
  gameTemplate: _.template(
    `<div class="tournament-item"><span id="#user-1"><%= 
    model.username
    %><span class="score">15</span></span><span>-</span><span id="#user-2"><span class="score">4</span><%= 
    model.username 
    %></span></div>`
  ),
  className: "tournament panel",
  initialize() {
    // this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.get("users"), "sync", this.render);
  },
  events: {
    "click #tournament-badge": "register",
  },
  render() {
    if (!this.model.get("users")) return;
    const now = new Date();
    const registrationOpen =
      new Date(this.model.get("start").replace(/-/g, "/")) > now &&
      new Date(this.model.get("registration_start").replace(/-/g, "/")) < now;
    this.$el.html(
      this.template({
        model: this.model,
        registrationOpen: registrationOpen,
        timeTitle: registrationOpen ? "start" : "end",
      })
    );
    this.renderUsers(!registrationOpen);
    this.renderGames();
    return this;
  },
  renderUsers(putRank) {
    console.log("MODEL:", this.model.get("users"));
    let html = "";
    let rank;
    if (putRank) {
      rank = 1;
    }
    this.model.get("users").each((user) => {
      if (user.get("user")) {
        console.log("USER", user.get("user"));
        html += this.userTemplate({ model: user.get("user"), rank: rank });
        rank++;
      }
    });
    this.$("#ranking").html(html);
  },
  renderGames() {
    // todo
    console.log("MODEL:", this.model.get("users"));
    let html = "";
    this.model.get("users").each((user) => {
      console.log("USER", user.get("user"));
      if (user.get("user")) {
        html += this.gameTemplate({ model: user.get("user") });
      }
    });
    this.$("#games").html(html);
  },
  register(e) {
    if (e.currentTarget.lastChild.data == "Register") this.model.register();
    else this.model.unregister();
  },
});
