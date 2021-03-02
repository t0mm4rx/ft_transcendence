import Backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import { showModal } from "../utils/modal";
import toasts from "../utils/toasts";

const User = Backbone.Model.extend({
  urlRoot: `http://${window.location.hostname}:3000/api/users`,
});

const Users = Backbone.Collection.extend({
  model: User,
  initialize({ id }) {
    this.url = `http://${window.location.hostname}:3000/api/guilds/${id}/users`;
  },
});

export default Backbone.View.extend({
  el: "body",
  template: _.template(`<div class="form-channel" id="edit">
   <div class="input-wrapper">
    <h3>Owners</h3>
    <div class="user-container" id="guild_owner">
    <%= owners %>
    </div>
    <div class="input-field">
    <input class="login" type="text" placeholder="Login" id="guild_owner" />
    <div class="autocomplete" id="owner"></div>
    <div style="display: inline;" class="button add" id="guild_owner">Add</div>
    </div>
  </div>
  <div class="input-wrapper">
    <h3>Officers</h3>
    <div class="user-container" id="guild_officer">
    <%= officers %>
    </div>
    <div class="input-field">
    <input class="login" type="text" placeholder="Login" id="guild_officer" />
    <div class="autocomplete" id="officer"></div>
    <div style="display: inline;" class="button add" id="guild_officer">Add</div>
    </div>
  </div>
  </div>`),
  userTemplate: _.template(
    `<div class="chat-edit user-profile" id="<%= user.id %>">
      <img class="avatar" id="chat-avatar" src="<%= user.escape("avatar_url") %>" />
      <span id="chat-username"><%= user.escape("username") %></span>
      <div class="button-icon delete" id="<%= category %>"><i class="fas fa-times-circle"></i></div>
    </div>`
  ),
  initialize() {
    this.users = new Users({ id: this.model.id });
    this.users.fetch({ success: () => this.render() });
  },
  events: {
    "click .add": "addToCategory",
    "click .delete": "removeFromCategory",
  },
  render() {
    let owners = "";
    let officers = "";

    this.users.each((user) => {

      if (user.get("guild_owner")) {
        owners += this.userTemplate({
          user: user,
          category: "guild_owner",
        });
      }
      if (user.get("guild_officer")) {
        officers += this.userTemplate({
          user: user,
          category: "guild_officer",
        });
      }
    });
    showModal(
      "Edit Guild",
      this.template({ owners: owners, officers: officers }),
      () => {
        this.saveChanges();
        this.undelegateEvents();
        this.$el.removeData().unbind();
        return true;
      },
      () => {
        this.undelegateEvents();
        this.$el.removeData().unbind();
      }
    );

    return this;
  },
  addToCategory(e) {
    const category = e.currentTarget.id;
    const login = $(`input.login#${category}`).val();
    if (login == "") return;
    const user = this.users.findWhere({ login: login });
    if (!user) {
      toasts.notifyError(
        `${login} is not a member of ${this.model.get("name")}`
      );
      return;
    }
    $(`input.login#${category}`).val("");
    user.set(category, true);
    $(`.user-container#${category}`).append(
      this.userTemplate({ user: user, category: category })
    );
  },
  removeFromCategory(e) {
    const user = e.currentTarget.parentNode;
    const category = e.currentTarget.id;
    this.users.get(user.id).set(category, false);
    user.remove(); // from DOM
  },
  saveChanges() {
    this.users.each((user) => {
      if (user.hasChanged()) {
        user.save(user.changed, {
          success: () => {},
          error: () => console.log("Error on save", user),
        });
      }
    });
  },
});
