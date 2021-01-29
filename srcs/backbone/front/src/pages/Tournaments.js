/* The home page. */
import Backbone from "backbone";
import $ from "jquery";
import template from "../../templates/tournaments.html";
import TournamentElement from "../views/TournamentElement";

export default Backbone.View.extend({
  el: "#page",
  render: function () {
    this.$el.html(template);
    this.renderTournaments();
  },
  renderTournaments() {
    const now = new Date();
    this.$(".tournament-listing#current").html("<h3>Tournaments</h3>");
    this.$(".tournament-listing#future").html("<h3>Upcoming</h3>");
    this.collection.each((tournament) => {
      const start = new Date(tournament.get("start"));
      const reg = new Date(tournament.get("registration_start"));
      const tournamentElement = new TournamentElement({ model: tournament });
      // console.log("T REG", reg);
      // console.log("T START", start);
      // console.log(now);
      console.log(tournament.get("name"), tournament.get("registered"));

      if (now > start) {
        this.$(".tournament-listing#current").append(
          tournamentElement.render().el
        );
      } else if (now > reg) {
        this.$(".tournament-listing#future").append(
          tournamentElement.render().el
        );
      }
    });
  },
});
