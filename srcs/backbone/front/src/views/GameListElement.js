import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

export default Backbone.View.extend({
  className: "history-item",
  initialize() {},
  events: {},
  render(user_id) {
    const winner =
      this.model.get("winner_id") === this.model.get("player").id
        ? "player"
        : "opponent";
    const loser = winner == "player" ? "opponent" : "player";
    const result = this.model.get("winner_id") == user_id ? "win" : "loss";

    let html = `<span><b>${this.model.get(winner).username}</b>
    <span class="history-item-win">${this.model.get(
      winner + "_score"
    )}</span> - <span>${this.model.get(loser + "_score")}</span> ${
      this.model.get(loser).username
    }
    <span class="history-item-info"> - ${this.model.escape(
      "game_type"
    )} game</span></span>
    <span class="history-item-${result}">${result}</span>`;

    this.$el.html(html);

    return this;
  },
});
