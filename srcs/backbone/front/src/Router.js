/* Here we define the routes and pages of our application. */

import Backbone from "backbone";
import Guilds from "./pages/Guilds";
import Home from "./pages/Home";
import Game from "./pages/Game";
import GameLive from "./pages/GameLive";
import Tournaments from "./pages/Tournaments";
import Auth from "./pages/Auth";
import NotificationsPanel from "./views/NotificationsPanel";
import Chat from "./views/Chat";
import UserMenu from "./views/UserMenu";
import Cookies from "js-cookie";
import $ from "jquery";
import UserView from "./pages/User";
import Livestream from "./pages/Livestream";
import Guild from "./pages/Guild";
import Admin from "./pages/Admin";
import toasts from "./utils/toasts";
import SearchBar from "./views/SearchBar";
import { Router } from "./models/Router";
import { User } from "./models/User";
import { connectGlobalSocket } from "./utils/globals"

export default Backbone.Router.extend({
  routes: {
    "": "home",
    home: "home",
    "home/": "home",
    "user/:id": "user",
    "user/:id/": "user",
    guilds: "guilds",
    "guilds/": "guilds",
    game: "game",
    "game/": "game",
    game_live: "game_live",
    "game_live/:id": "game_live",
    "game_live/:id/": "game_live",
    "livestream/:id": "livestream",
    "livestream/:id/": "livestream",
    tournaments: "tournaments",
    "tournaments/(:id)": "tournaments",
    "tournaments/:id/": "tournaments",
    "guild/:id": "guild",
    "guild/:id/": "guild",
    admin: "admin",
    "admin/": "admin",
    auth: "auth",
    "auth/": "auth",
    token: "token",
    "token/": "token",
    ":whatever": "notFound",
    ":whatever/": "notFound",
  },
  home: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Home();
    window.currentView.render();
  },
  user: function (id) {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    const user =
      id == window.currentUser.get("login")
        ? window.currentUser
        : new User({ id: id });
    window.currentView = new UserView({ model: user });
    user.fetch();
  },
  guilds: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Guilds();
    window.currentView.render();
  },
  game: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Game();
    window.currentView.render();
  },
  game_live: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new GameLive();
    window.currentView.render();
  },
  livestream: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Livestream();
    window.currentView.render();
  },
  tournaments: function (id) {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Tournaments({ collection: window.tournaments });
    window.tournaments.fetch({
      success: () => window.currentView.render(id),
      error: () => toasts.notifyError("Could not load tournaments."),
    });
  },
  guild: function (id) {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Guild({ anagram: id });
    window.currentView.render();
  },
  admin: function () {
    this.closeGame();
    this.checkLogged();
    this.showLayout();
    if (!window.currentUser.get("admin")) {
      window.location.hash = "/";
      return;
    }
    if (window.currentView) {
      window.currentView.undelegateEvents();
      window.currentView.unbind();
      window.currentView.stopListening();
    }
    window.currentView = new Admin({
      collection: window.chat,
    });
    window.chat.fetch({ success: () => window.currentView.render() });
    // window.currentView = new Admin();
    // window.currentView.render();
  },
  auth: function () {
    if (!!Cookies.get("user")) {
      window.location.hash = "/";
    } else {
      this.hideLayout();
      if (window.currentView) {
        window.currentView.undelegateEvents();
        window.currentView.unbind();

        window.currentView.stopListening();
      }
      window.currentView = new Auth();
      window.currentView.render();
    }
  },
  token: function () {
    $("body").html("You are being redirected...");
    window.opener.postMessage(
      {
        params: window.location.href.split("?")[1],
      },
      "*"
    );
  },
  notFound: function () {
    window.location.hash = "/";
  },
  /* Check if the user is logged, if not we redirect him to the auth page */
  checkLogged: function () {
    const user = Cookies.get("user");
    if (!user) {
      window.location.hash = "auth/";
    }
    connectGlobalSocket();

  },
  /* Show chat panel, notification panel and other elements only visible when logged */
  showLayout: function () {
    $("#menu").show();
    if (!window.userMenuView) {
      window.userMenuView = new UserMenu({ model: window.currentUser });
      window.userMenuView.render();
    }
    if (!window.notificationPanelView) {
      window.notificationPanelView = new NotificationsPanel({
        model: window.notifications,
      });
      window.notificationPanelView.render();
    }
    if (!window.chatPanelView) {
      window.chatPanelView = new Chat({ collection: window.chat });
      window.chatPanelView.render();
    }
    if (!window.searchBar) {
      window.searchBar = new SearchBar();
    }
  },
  hideLayout: function () {
    $("#menu").hide();
    if (window.chatPanelView) {
      window.location.reload();
    }
  },
  closeGame: function () {
    const actual = window.currentView;
  if (actual && (!!actual.game || !!actual.gamelive)) {
      const router = new Router();
      if (!!actual.gamelive)
      {
        if(!!actual.game_canvas) { clearInterval(actual.game_canvas.timer); }
        if(window.currentUser.get('status') !== "online") { window.currentUser.changeStatus("online");}
      }
        if (!!actual.game) { router.clearRequests(); }
      if (actual.ftsocket) actual.ftsocket.closeConnection();
    }
  },
});
