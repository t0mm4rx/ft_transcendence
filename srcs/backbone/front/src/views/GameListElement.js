import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

export default Backbone.View.extend({
  className: "history-item",
  initialize() {},
  events: {},
  render(user_id) {
    let game_type = "direct";
    if (this.model.get("ladder")) game_type = "ladder";
    else if (this.model.get("game_type") == "war") game_type = "war";
    else if (this.model.get("tournament")) game_type = "tournament";
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
    <span class="history-item-info"> - ${game_type} game</span></span>
    <span class="history-item-${result}">${result}</span>`;

    this.$el.html(html);

    return this;
  },
});
