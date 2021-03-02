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
    if (id && this.collection.get(id)) this.renderTournament(id);
    else this.renderPermanent();
  },
  renderTournamentList(id) {

    const now = new Date();
    this.$(".tournament-listing#current")
      .html(`<h3>Tournaments</h3><a href="/#tournaments">
    <h4 class="tournament-item permanent${
      !id ? " current" : ""
    }  id="permanent">PERMANENT</h4></a>`);
    this.$(".tournament-listing#future").html("<h3>Upcoming</h4>");
    this.collection.each((tournament) => {

      const start = new Date(tournament.get("start").replace(/-/g, "/"));
      const reg = new Date(
        tournament.get("registration_start").replace(/-/g, "/")
      );

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
    const model = this.collection.get(id);
    model.getUsers();
    this.stopListening();
    this.tournamentView = new TournamentView({
      model: model,
    });
    $(".tournament").replaceWith(this.tournamentView.render().el);
  },
  stopListening() {
    if (this.tournamentView) {
      this.tournamentView.undelegateEvents();
      this.tournamentView.unbind();
      this.tournamentView.stopListening();
    }
  },
  renderPermanent() {
    this.stopListening();
    this.tournamentView = new TournamentView({
      model: window.permanentTournament,
    });
    $(".tournament").replaceWith(this.tournamentView.renderPermanent().el);
  },
});
