import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const TournamentUsers = Backbone.Collection.extend({
  initialize(props) {
    this.url = `http://${window.location.hostname}:3000/api/tournaments/${props.id}/users`;
  },
});
const TournamentGames = Backbone.Collection.extend({
  url: `http://${window.location.hostname}:3000/api/ladder_games`,
  initialize(props) {
    if (props)
      this.url = `http://${window.location.hostname}:3000/api/tournaments/${props.id}/games`;
  },
});

const PermanentTournament = Backbone.Model.extend({
  initialize() {
    this.set("users", window.users);
  },
  getGames() {
    const games = new TournamentGames();
    this.set("games", games);
    games.fetch();
  },
});

const Tournament = Backbone.Model.extend({
  // initialize() {
  //   const users = new TournamentUsers({ id: this.id });
  //   this.set("users", users);
  //   users.fetch();
  // },
  getUsers() {
    const users = new TournamentUsers({ id: this.id });
    this.set("users", users);
    users.fetch();
  },
  getGames() {
    const games = new TournamentGames({ id: this.id });
    this.set("games", games);
    games.fetch();
  },
  register() {
    $.ajax({
      url: this.url() + "/register",
      type: "POST",
      success: () => {
        toasts.notifySuccess(`You have successfully registered!`);
        this.set("registered", true);
        this.get("users").fetch();
      },
      error: (state) => {
        // toasts.notifyError(state);
        toasts.notifyError(state.responseJSON.error);
      },
    });
  },
  unregister() {

    $.ajax({
      url: this.url() + "/unregister",
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`You have successfully unregistered!`);
        this.set("registered", false);
        this.get("users").fetch();
      },
      error: (state) => {
        console.log("Unregister tournament error: ", state);
        toasts.notifyError(state);
      },
    });
  },
});

const Tournaments = Backbone.Collection.extend({
  url: `http://${window.location.hostname}:3000/api/tournaments/`,
  model: Tournament,
});

export { Tournaments, PermanentTournament };
