import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";

export default Backbone.View.extend({
  initialize() {
    this.userTemplate = _.template(
      `<div class="chat-edit user-profile" id="<%= model.escape("user_id") %>">
        <img id="chat-avatar" src="<%= model.escape("avatar") %>" />
        <span id="chat-username"><%= model.escape("username") %></span>
        <div class="button-icon delete" id="<%= category %>"><i class="fas fa-times-circle"></i></div>
      </div>`
    );
    this.template = _.template($("#tpl-edit-channel-form").html());
    // this.listenTo(this.model, "destroy", () => this.remove());
    // this.listenTo(this.collection, "change", this.renderUser);
  },
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
    "click .add": "addToCategory",
    "click .delete": "removeFromCategory",
  },
  render(owner, admin) {
    const templateData = this.renderChannelUsers(owner, admin);
    showModal(
      "Edit channel",
      this.template(templateData),
      () => {
        this.collection.saveChanges();
        if (!admin && owner) {
          const password = $("#new-channel-password").val();
          const no_pass = $("#no-password:checked").length > 0;
          if (password.length > 0 && no_pass) {
            toasts.notifyError("Enter a password or check the box");
            return false;
          }
          if (
            (password == "" && !no_pass) ||
            (this.model.get("private") === false && no_pass)
          )
            return true;
          const data = no_pass
            ? `remove_password=${true}`
            : `add_change_password=${password}`;
          let success_message = no_pass ? "removed" : "changed";
          if (this.model.get("private") === false) success_message = "added";
          window.chat.editChannel(data, this.model.id, success_message);
        }
        this.undelegateEvents();
        this.$el.removeData().unbind();
        return true;
      },
      () => {
        console.log("CANCEL");
        this.collection.rollbackChanges();
        this.undelegateEvents();
        this.$el.removeData().unbind();
      }
    );
    $(".autocomplete").hide();
  },
  renderChannelUsers(owner, admin) {
    let htmlOwners = "";
    this.collection.where({ owner: true }).forEach((user) => {
      htmlOwners += this.userTemplate({ model: user, category: "owner" });
    });
    let htmlAdmins = "";
    this.collection.where({ admin: true }).forEach((user) => {
      htmlAdmins += this.userTemplate({ model: user, category: "admin" });
    });
    let htmlMuted = "";
    this.collection.where({ muted: true }).forEach((user) => {
      htmlMuted += this.userTemplate({ model: user, category: "muted" });
    });
    let htmlBanned = "";
    this.collection.where({ banned: true }).forEach((user) => {
      htmlBanned += this.userTemplate({ model: user, category: "banned" });
    });
    return {
      admin: admin,
      owner: owner,
      owners: htmlOwners,
      admins: htmlAdmins,
      muted: htmlMuted,
      banned: htmlBanned,
    };
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
    const user = this.collection.addAs(category, username, date);
    $(`input.username#${category}`).val("");
    if (!user) {
      toasts.notifyError(`Failed to add ${username} as ${category}`);
    } else {
      $(`.user-container#${category}`).append(
        this.userTemplate({ model: user, category: category })
      );
      console.log("EDITED USER", user);
    }
  },
  removeFromCategory(e) {
    console.log("REMOVE", e);
    const user = e.currentTarget.parentNode;
    // const username = e.currentTarget.previousElementSibling.innerHTML;
    const category = e.currentTarget.id;
    console.log("CAT", category);

    // this.collection.removeAs(category, username);
    this.collection.removeAs(category, user.id);
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
    const condition = {
      // owner: false,
      admin: false,
      banned: false,
      muted: false,
    };

    this.collection.where(condition).forEach((user) => {
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
