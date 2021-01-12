import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { ChannelUsers } from "../models/ChannelUsers";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.userTemplate = _.template($("#tpl-edit-channel-form-user").html());
    this.template = _.template($("#tpl-edit-channel-form").html());
    this.listenTo(this.model, "change", this.renderUser);
  },
  model: ChannelUsers,
  el: "body",
  events: {
    "keyup input.username": "keyPressEventHandler",
    "focus input.username": "autocomplete",
    "blur input.username": "closeAutocomplete",
    "click .autocomplete-item": function (e) {
      const id = `input.username#${e.currentTarget.parentNode.id}`;
      $(id).val(e.currentTarget.innerText);
      $(id).blur();
    },
    "click .button.add": "addToCategory",
    "click .button-icon.delete": "removeFromCategory",
  },
  render(owner) {
    const templateData = this.renderChannelUsers(owner);
    showModal(
      "Edit channel",
      this.template(templateData),
      () => {
        if (owner) {
          const password = $("#new-channel-password").val();
          const no_pass = $("#no-password:checked").length > 0;
          if (password.length > 0 && no_pass) {
            toasts.notifyError("Enter a password or check the box");
            return false;
          }
          this.model.editPassword(password, no_pass);
        }
        this.model.save();
        return true;
      },
      () => {}
    );
    $(".autocomplete").hide();
  },
  renderChannelUsers(owner) {
    let htmlAdmins = "";
    this.model.where({ admin: true }).forEach((user) => {
      htmlAdmins += this.userTemplate(user.toJSON());
    });
    let htmlMuted = "";
    this.model.where({ muted: true }).forEach((user) => {
      htmlMuted += this.userTemplate(user.toJSON());
    });
    let htmlBanned = "";
    this.model.where({ banned: true }).forEach((user) => {
      htmlBanned += this.userTemplate(user.toJSON());
    });
    return {
      owner: owner,
      admins: htmlAdmins,
      muted: htmlMuted,
      banned: htmlBanned,
    };
  },
  renderUser(e) {
    console.log("RENDER USER", e);
  },
  addToCategory(e) {
    let date;
    const category = e.currentTarget.id; //  admin | banned | muted
    const username = $(`input.username#${category}`).val();
    if (username == "") return;
    if (category === "banned" || category === "muted") {
      date = $(`input#${category}-until`).val();
      $(`input#${category}-until`).val("");
      if (!date) {
        toasts.notifyError("Date can't be blank!");
        return;
      }
    }
    const user = this.model.addAs(category, username, date);
    $(`input.username#${category}`).val("");
    if (!user) {
      toasts.notifyError("No such user");
    } else {
      $(`.user-container#${category}`).append(this.userTemplate(user.toJSON()));
      console.log("EDITED USER", user);
    }
  },
  removeFromCategory(e) {
    const user = e.currentTarget.parentNode;
    const category = $(e.currentTarget).parents(".user-container")[0].id;
    this.model.removeAs(category, user.id);
    user.remove(); // from DOM
  },

  keyPressEventHandler(event) {
    if (event.target.className == "username-input") {
      if (event.keyCode === 27) {
        event.target.blur();
      } else {
        this.autocomplete(event);
      }
    }
  },
  autocomplete(e) {
    // console.log(e.currentTarget);

    const query = $(e.currentTarget).val();
    console.log("QUERY:", query);

    let result = false;
    console.log(e);

    const id = `.autocomplete#${e.target.id}`;
    $(id).html("");
    // * only suggest users with no role yet
    const condition = { admin: false, banned: false, muted: false };

    this.model.where(condition).forEach((user) => {
      if (user.get("user_id") == window.currentUser.id) return;
      if (query.length === 0 || user.get("username").indexOf(query) !== -1) {
        $(id).append(
          `<span class="autocomplete-item">${user.get("username")}</span>`
        );
        result = true;
      }
    });
    if (!result) {
      $(id).append(`<div id="autocomplete-no-result">No result found</div>`);
    }
    $(id).show();
    $("#input-container .fa-search").addClass("fa-times");
  },
  closeAutocomplete(e) {
    const id = `.autocomplete#${e.target.id}`;
    setTimeout(() => {
      $(id).hide();
      $("#input-container .fa-times").addClass("fa-search");
    }, 100);
  },
});
