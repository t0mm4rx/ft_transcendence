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
  className: "tournament panel",
  initialize() {
    this.render();
    this.listenTo(this.model, "change", this.render);
  },
  events: {
    "click #tournament-badge": "register",
  },
  render() {
    const now = new Date();
    const registrationOpen =
      new Date(this.model.get("start")) > now &&
      new Date(this.model.get("registration_start")) < now;
    this.$el.html(
      this.template({ model: this.model, registrationOpen: registrationOpen })
    );
    return this;
  },
  register(e) {
    if (e.currentTarget.lastChild.data == "Register") this.model.register();
    else this.model.unregister();
  },
});
