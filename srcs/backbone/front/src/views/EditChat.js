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
    this.listenTo(this.model, "sync", this.render);
    // this.listenTo(this.model, "change", this.render);
  },
  model: ChannelUsers,
  el: "body",
  events: {
    "keyup .username-input": "keyPressEventHandler",
    "focus .username-input": "autocomplete",
    "blur .username-input": "closeAutocomplete",
    "click .button#add-Admin": function () {
      const user = this.model.addAdmin($(".username-input#admin").val());
      $(".username-input#admin").val("");
      $(".user-container#admins").append(this.userTemplate(user.toJSON()));
    },
    "click .autocomplete-item": function (e) {
      const id = `.username-input#${e.target.parentNode.id}`;
      $(id).val(e.currentTarget.innerText);
      $(id).blur();
    },
    "click .button-icon.delete": function (e) {
      const id = e.currentTarget.id;
      console.log("E TARGET", e, e.currentTarget);

      const type = $(e.currentTarget).parents(".user-container")[0].id;
      this.model.remove(type, id);
      const user = $(e.currentTarget).parents(".user-profile");
      user.remove();
    },
  },
  render() {
    const templateData = this.renderChannelUsers();
    showModal(
      "Edit channel",
      this.template(templateData),
      () => {
        const password = $("#new-channel-password").val();
        const no_pass = $("#no-password:checked").length > 0;
        if ((password.length > 0) ^ !no_pass) {
          toasts.notifyError("Enter a password or check the box");
          return false;
        }
        // if (this.currentChat.get("private") == false && no_pass) return true;
        // const data = no_pass
        //   ? `remove_password=${true}`
        //   : `add_change_password=${password}`;
        // let success_message = no_pass ? "removed" : "changed";
        // if (this.currentChat.get("private") == false) success_message = "added";
        // this.model.editChannel(data, this.currentChat.id, success_message);
        return true;
      },
      () => {}
    );
    $("#autocomplete-container").hide();
  },
  renderChannelUsers() {
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
      admins: htmlAdmins,
      muted: htmlMuted,
      banned: htmlBanned,
    };
  },
  keyPressEventHandler(event) {
    console.log("KEY EVENT");

    // if (event.target.id == "channel-input") {
    //   if (event.keyCode === 27) {
    //     event.target.blur();
    //   } else {
    //     this.autocomplete();
    //   }
    // }
    if (event.keyCode === 13) {
      if (event.target.id == "admin") {
        this.model.addAdmin($(".username-input#admin").val());
      } else if (event.target.id == "muted") {
      } else if (event.target.id == "banned") {
      }
    }
  },
  autocomplete(e) {
    const query = $("#channel-input").val();
    let result = false;
    console.log(e);

    const id = `.autocomplete#${e.target.id}`;
    $(id).html("");
    const condition =
      e.target.id == "admin" ? { admin: false } : { banned: false };

    this.model.where(condition).forEach((user) => {
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
