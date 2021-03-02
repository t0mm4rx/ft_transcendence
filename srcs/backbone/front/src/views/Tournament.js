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
      <span id="time"><%= model.get("finished") ? "Ended" : "Ongoing" %></span>
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
    `<div class="tournament-item"><b><span id="#user-1"><%=
    model.get(winner).username
    %><span class="score"><%= model.escape(winner + "_score") %></span></span></b><span>-</span><span id="#user-2"><span class="score"><%= model.escape(loser + "_score") %></span><%=
    model.get(loser).username
    %></span></div>`
  ),
  className: "tournament panel",
  initialize() {
    // this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.get("users"), "sync", this.render);
    this.listenTo(this.model.get("games"), "sync", this.renderGames);
    this.model.getGames();
  },
  events: {
    "click #tournament-badge": "register",
  },
  render() {
    if (
      !this.model.get("users") ||
      !this.model.get("start") ||
      !this.model.get("registration_start")
    )
      return this;

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
    if (this.model.get("winner")) {
      const winner = this.model.get("winner");

      this.$("#img2").replaceWith(
        `<img src="${winner.avatar_url}" id="img2" class="avatar"/>`
      );
      this.$("#time").replaceWith(
        `<span id="time">Winner:</span><h3 id="time">${winner.username}</h3>`
      );
    }
    this.renderUsers(
      this.model.get("users").map((user) => (user ? user.get("user") : user)),
      !registrationOpen
    );
    this.renderGames();
    return this;
  },
  renderPermanent() {
    this.$el.attr("id", "permanent");

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
        html += this.userTemplate({ model: user, rank: rank });
        if (rank) rank++;
      }
    });
    this.$("#ranking").html(html);
  },
  renderGames() {
    let html = "";
    this.model.get("games").each((game) => {
      if (game.get("player") != null && game.get("opponent") != null) {
        const winner =
          game.get("winner_id") === game.get("player").id
            ? "player"
            : "opponent";
        const loser = winner == "player" ? "opponent" : "player";
        html += this.gameTemplate({
          model: game,
          winner: winner,
          loser: loser,
        });
      }
    });
    this.$("#games").html(html);
  },
  register(e) {
    if (e.currentTarget.lastChild.data == "Register") this.model.register();
    else this.model.unregister();
  },
});
