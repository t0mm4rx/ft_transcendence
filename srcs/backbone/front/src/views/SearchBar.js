import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { SearchResults } from "../models/SearchResults";

export default Backbone.View.extend({
  el: "#search-bar",
  template: _.template(
    `<a href="<%= link %>" class="search-result-object"><%= name %></a>`
  ),
  initialize() {
    this.search = new SearchResults();
    this.listenTo(this.search, "sync", this.showResults);
    $(".search-result").hide();
  },
  events: {
    click: "showInput",
    "keyup #search-input": "onKeyUp",
    "blur #search-input": function () {
      setTimeout(() => this.hideSearch(), 200);
    },
  },
  showInput() {
    console.log("SHOW INPUT");

    this.$(".fa-search").addClass("hidden");
    this.$("#search-input").removeClass("hidden");
  },
  onKeyUp(e) {
    const input = $("#search-input").val();
    if (input.length >= 2 || (e.keyCode == 13 && input.length > 0)) {
      this.search.for(input);
    }
    if (e.keyCode == 13) $("#search-input").val("");
  },
  showResults() {
    console.log("SHOW RESULTS", this.search, this.search.get("users"));
    let html =
      this.search.get("users").length > 0
        ? `<h3 class="search-title">USERS</h3>`
        : "";
    this.search.get("users").forEach(
      (user) =>
        (html += this.template({
          link: `#user/${user.name}`,
          name: user.name,
        }))
    );
    if (this.search.get("guilds").length > 0)
      html += `<h3 class="search-title">GUILDS</h3>`;
    this.search.get("guilds").forEach(
      (guild) =>
        (html += this.template({
          link: `#guild/${guild.name}`,
          name: guild.name,
        }))
    );
    if (this.search.get("tournaments").length > 0)
      html += `<h3 class="search-title">TOURNAMENTS</h3>`;
    this.search.get("tournaments").forEach(
      (tournament) =>
        (html += this.template({
          link: `#tournaments/${tournament.id}`,
          name: tournament.name,
        }))
    );
    this.$(".search-result").html(html);
    // this.$(".search-result").removeClass("hidden");
    $(".search-result").show();
  },
  hideSearch() {
    $("#search-input").val("");
    $(".search-result").hide();
    this.$(".fa-search").removeClass("hidden");
    this.$("#search-input").addClass("hidden");
  },
});
