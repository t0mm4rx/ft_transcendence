import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";

const Tournament = Backbone.Model.extend({
  register() {
    console.log("REGISTER");

    $.ajax({
      url: this.url() + "/register",
      type: "POST",
      success: () => {
        toasts.notifySuccess(`You have successfully registered!`);
        this.set("registered", true);
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

export { Tournaments };
