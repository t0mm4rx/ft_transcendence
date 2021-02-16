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
    
    <span id="players">players:</span><h3 id="players"><%= model.get("users").length || 0 %></h3>

    <% if (time) { %>
    <span id="time">Start:</span><h3 id="time"><%= time %></h3>
    <% } else { %> 
      <span id="time">Ongoing</span>
    <% } %>
    <span id="prize">title: </span><h3 id="prize"><%= model.escape("title") %></h3>
  </div>
  <div class="current-tournament" id="ranking"></div>
  <div class="current-tournament" id="games"></div>`
  ),
  permanentTemplate: `<div class="current-tournament" id="information">
    <h1>PERMANENT</h1>
    </div>
    <div class="current-tournament" id="ranking"></div>
    <div class="current-tournament" id="games"></div>`,
  userTemplate: _.template(
    `<div class="tournament-item"><% if (rank) {%> <span class="rank"><%= rank %>. </span><%} %>
    <a href="/#user/<%= model.login %>/"><img class="tournament-avatar" src="<%= model.avatar_url %>" /></a><span><%= model.username %></span>
    </div>`
  ),
  gameTemplate: _.template(
    `<div class="tournament-item"><span id="#user-1"><%= 
    model.get("player").username
    %><span class="score"><%= model.escape("player_score") %></span></span><span>-</span><span id="#user-2"><span class="score"><%= model.escape("opponent_score") %></span><%= 
    model.get("opponent").username
    %></span></div>`
  ),
  className: "tournament panel",
  initialize() {
    this.model.getGames();
    // this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.get("users"), "sync", this.render);
    this.listenTo(this.model.get("games"), "sync", this.renderGames);
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
    const time = registrationOpen
      ? new Date(this.model.get("start").replace(/-/g, "/")).toLocaleString(
          "en-US",
          {
            month: "numeric",
            day: "numeric",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : null;
    this.$el.html(
      this.template({
        model: this.model,
        registrationOpen: registrationOpen,
        time: time,
      })
    );
    this.renderUsers(
      this.model.get("users").map((user) => (user ? user.get("user") : user)),
      !registrationOpen
    );
    // this.renderGames();
    return this;
  },
  renderPermanent() {
    this.$el.attr("id", "permanent");
    // console.log($(".tournament.panel"));

    this.$el.html(this.permanentTemplate);
    this.renderUsers(
      this.model.get("users").map((user) => user.toJSON()),
      true
    );
    return this;
  },
  renderUsers(users, putRank) {
    let html = "";
    let rank;
    if (putRank) {
      rank = 1;
    }
    users.forEach((user) => {
      if (user) {
        console.log("User", user);
        html += this.userTemplate({ model: user, rank: rank });
        if (rank) rank++;
      }
    });
    this.$("#ranking").html(html);
  },
  renderGames() {
    // todo
    console.log("GAMES:", this.model.get("games"));
    let html = "";
    this.model.get("games").each((game) => {
      if (game.get("player") != null && game.get("opponent") != null)
        html += this.gameTemplate({ model: game });
    });
    this.$("#games").html(html);
  },
  register(e) {
    if (e.currentTarget.lastChild.data == "Register") this.model.register();
    else this.model.unregister();
  },
});
