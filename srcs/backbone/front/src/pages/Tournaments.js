/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/tournaments.html";
import TournamentView from "../views/Tournament";
import _ from "underscore";

export default Backbone.View.extend({
  template: _.template(
    `<a href="/#tournaments/<%= tournament.id %>">
    <span class="tournament-item<%= currentClass%>" id="<%= tournament.id %>"><%= 
    tournament.escape("name")
    %></span></a>`
  ),
  el: "#page",
  render: function (id) {
    this.$el.html(template);
    this.renderTournamentList(id);
    if (id) this.renderTournament(id);
  },
  renderTournamentList(id) {
    console.log("ID1 :", id);

    const now = new Date();
    this.$(".tournament-listing#current").html("<h3>Tournaments</h3>");
    this.$(".tournament-listing#future").html("<h3>Upcoming</h3>");
    this.collection.each((tournament) => {
      console.log("TOURNAMENT :", tournament);

      const start = new Date(tournament.get("start").replace(/-/g, "/"));
      const reg = new Date(
        tournament.get("registration_start").replace(/-/g, "/")
      );
      // console.log("NOW", now);
      // console.log("START", tournament.get("start"));
      // console.log("REG", reg);

      let currentClass = "";
      if (id == tournament.id) {
        currentClass = " current";
      }
      if (now > start) {
        this.$(".tournament-listing#current").append(
          this.template({ tournament: tournament, currentClass: currentClass })
        );
      } else if (now > reg) {
        this.$(".tournament-listing#future").append(
          this.template({ tournament: tournament, currentClass: currentClass })
        );
      }
    });
  },
  renderTournament(id) {
    console.log("ID:", id);
    const model = this.collection.get(id);
    model.getUsers();
    // $(`.tournament-item.current`).removeClass("current");
    // $(`.tournament-item#${id}`).addClass("current");
    if (this.tournamentView) {
      this.tournamentView.undelegateEvents();
      this.tournamentView.unbind();
      this.tournamentView.stopListening();
    }
    this.tournamentView = new TournamentView({
      model: model,
    });
    $(".tournament").replaceWith(this.tournamentView.render().el);
  },
});
