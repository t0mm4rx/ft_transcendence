import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const Tournament = Backbone.Model.extend({
  register() {},
  unregister() {},
});

const Tournaments = Backbone.Collection.extend({
  url: "http://localhost:3000/api/tournaments/",
  model: Tournament,
});

export { Tournaments };
