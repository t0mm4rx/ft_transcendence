import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

export default Backbone.View.extend({
  template: _.template(`
    <span><b><%= game.get("player").username %></b> <span class="history-item-win"><%= game.escape("player_score") %></span> - <span><%= game.escape("opponent_score") %></span> <%= game.get("opponent").username %><span class="history-item-info"> - <%= game_type %> game</span></span>
    <span class="history-item-<%= result %>"><%= result %></span>`),
  className: "history-item",
  initialize() {},
  events: {},
  render() {
    let game_type = "direct";
    if (this.model.get("ladder")) game_type = "ladder";
    else if (this.model.get("game_type") == "war") game_type = "war";
    else if (this.model.get("tournament")) game_type = "tournament";
    if (this.model.get("player") && this.model.get("opponent"))
      this.$el.html(
        this.template({
          game: this.model,
          result: this.model.get("winner_id") == this.model.id ? "win" : "loss",
          game_type: game_type,
        })
      );
    return this;
  },
});
