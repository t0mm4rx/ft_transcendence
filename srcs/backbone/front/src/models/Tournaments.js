import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const PermanentTournament = Backbone.Model.extend({
  initialize() {
    this.set("users", window.users);
  },
});

const TournamentUsers = Backbone.Collection.extend({
  initialize(props) {
    this.url = `http://localhost:3000/api/tournaments/${props.id}`;
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
  register() {
    console.log("REGISTER");

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
    console.log("UNREGISTER");

    $.ajax({
      url: this.url() + "/unregister",
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`You have successfully unregistered!`);
        this.set("registered", false);
        this.get("users").fetch();
      },
      error: (state) => {
        // console.log(this.model);
        console.log(state);

        toasts.notifyError(state);
        // toasts.notifyError(state.responseJSON.error);
      },
    });
  },
});

const Tournaments = Backbone.Collection.extend({
  url: "http://localhost:3000/api/tournaments/",
  model: Tournament,
});

export { Tournaments, PermanentTournament };
