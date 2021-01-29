import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import TournamentView from "./Tournament";

export default Backbone.View.extend({
  tagName: "span",
  className: "tournament-item",
  initialize() {},
  events: {
    click: "renderTournament",
  },
  render() {
    this.$el.html(this.model.escape("name"));
    return this;
  },
  renderTournament() {
    $(`.tournament-item.current`).removeClass("current");
    this.$el.addClass("current");
    this.tournamentView = new TournamentView({ model: this.model });
    $(".tournament").replaceWith(this.tournamentView.render().el);
  },
});
