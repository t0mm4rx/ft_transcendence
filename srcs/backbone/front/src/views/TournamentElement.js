import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { Channel } from "../models/Channel";
import ChannelView from "./Channel";

export default Backbone.View.extend({
  template: _.template(
    `<div class="current-tournament" id="information">
    <h1><%= model.escape("name") %></h1>
    <img src="/assets/time.png" alt="" />
    <span id="players">registration start: <%= new Date(model.escape("registration_start")) %></span>
    <span id="time">start: <%= new Date(model.escape("start")) %></span>
    <span id="prize">end: <%= new Date(model.escape("end")) %></span>
  </div>
  <div class="current-tournament" id="ranking">
    <div class="tournament-item">
      <span>1. Freddie</span>
    </div>
    <div class="tournament-item">
      <span>2. Mathis</span>
    </div>
  </div>
  <div class="current-tournament" id="games">
    <div class="tournament-item">
      <span>Freddie vs Mathis</span>
    </div>
    <div class="tournament-item">
      <span>Freddie vs Mathis</span>
    </div>
  </div>`
  ),
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
    $(".tournament").html(this.template({ model: this.model }));
  },
});
