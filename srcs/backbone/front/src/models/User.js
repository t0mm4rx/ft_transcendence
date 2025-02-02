/* The model representing a user. */
import Backbone from "backbone";
import $ from "jquery";
import toasts from "../utils/toasts";
import Cookies from "js-cookie";
import { create } from "underscore";

const UserGames = Backbone.Collection.extend({
  initialize(props) {
    this.url = `http://${window.location.hostname}:3000/api/users/${props.id}/games`;
  },
});

const User = Backbone.Model.extend({
  urlRoot: `http://${window.location.hostname}:3000/api/users/`,
  save: function (key, value) {
    $.ajax({
      url:
        `http://` +
        window.location.hostname +
        `:3000/api/users/${this.get("id")}/`,
      type: "PUT",
      data: `${key}=${value}`,
      success: () => {
        this.set(key, value);
        if (this.id === window.currentUser.id)
          window.currentUser.set(key, value);
      },
      error: (error) => {
        toasts.notifyError("Cannot update property.");
        console.log("Save user error : ", error);
      },
    });
  },
  askFriend: function () {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/friends/`,
      type: "POST",
      data: `id=${this.get("id")}`,
      success: () => {
        this.set("relation_to_user", "request sent");

        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "friend_request",
              content: {
                request_to: this.get("id"),
                from: {
                  id: window.currentUser.get("id"),
                  login: window.currentUser.get("login"),
                },
              },
            },
          },
          false,
          true
        );
        toasts.notifySuccess("Friend request sent.");
      },
      error: (err) => {
        toasts.notifyError("Cannot send a friend request.");
        console.log("Ask frien user error: ", err);
      },
    });
  },
  unfriend: function () {
    $.ajax({
      url:
        `http://` +
        window.location.hostname +
        `:3000/api/friends/${this.get("id")}/`,
      type: "DELETE",
      success: () => {
        this.set("relation_to_user", null);
        if (this.get("login"))
          toasts.notifySuccess(
            `${this.get("login")} is not your friend anymore.`
          );
        else toasts.notifySuccess(`You're not friends anymore.`);

        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "unfriend_request",
              content: {
                request_to: this.get("id"),
                from: {
                  id: window.currentUser.get("id"),
                  login: window.currentUser.get("login"),
                },
              },
            },
          },
          false,
          true
        );

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log("Unfriend user error: ", err);
      },
    });
  },
  acceptFriend: function () {
    $.ajax({
      url:
        `http://` +
        window.location.hostname +
        `:3000/api/friends/${this.get("id")}`,
      type: "PUT",
      success: () => {
        this.set("relation_to_user", "friends");
        if (this.get("login"))
          toasts.notifySuccess(`${this.get("login")} is now your friend.`);
        else toasts.notifySuccess(`You have a new friend!`);

        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "friend_request_reply",
              content: {
                request_to: this.get("id"),
                from: {
                  id: window.currentUser.get("id"),
                  login: window.currentUser.get("login"),
                },
              },
            },
          },
          false,
          true
        );

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log("Accept friend error: ", err);
        toasts.notifyError("An error occured.");
      },
    });
  },
  askGuild: function () {
	$.ajax({
		url: `http://${window.location.hostname}:3000/api/guilds/send_request`,
		type: 'POST',
		data: `target_id=${this.get("id")}`,
		success: () => {
      toasts.notifySuccess(`You invited ${this.get('username')} in your guild.`);
      window.globalSocket.sendMessage(
        {
          action: "to_broadcast",
          infos: {
            message: "guild_invite",
            content: {
              from: window.currentUser.get("guild").name,
              request_to: this.get("id"),
              desc: "Guild request"
            },
          },
        },
        false,
        true
      );
		},
		error: () => {
			toasts.notifyError("Cannot send guild request.");
		}
	});
  },
  acceptGuildInvite: function () {
    $.ajax({
      url: `http://${window.location.hostname}:3000/api/guilds/accept_invitation`,
      type: "POST",
      success: () => {
        toasts.notifySuccess(`You joined the guild!`);
        window.currentUser.fetch();
        window.guilds.fetch();
      },
      error: () => {
        toasts.notifyError("Unable to join the guild.");
      },
    });
  },
  declineGuildInvite: function () {
    $.ajax({
      url: `http://${window.location.hostname}:3000/api/guilds/ignore_invitation`,
      type: "POST",
      success: () => {
        toasts.notifySuccess(`You declined the guild invitation.`);
        window.currentUser.fetch();
      },
      error: () => {
        toasts.notifyError("Unable to decline the invitation.");
      },
    });
  },
  setTFA: function () {
    $.ajax({
      url: "http://" + window.location.hostname + ":3000/api/tfa",
      type: "POST",
    });
    window.currentUser.fetch();
  },
  block() {
    $.ajax({
      url: "http://" + window.location.hostname + ":3000/api/blocked",
      type: "POST",
      data: { target_id: this.id },
      success: () => {
        toasts.notifySuccess(`You just blocked ${this.get("username")}`);
        this.set("blocked", true);
        window.chat.trigger("block");
      },
      error: () =>
        toasts.notifyError(`Could not block ${this.get("username")}`),
    });
  },
  unblock() {
    $.ajax({
      url:
        `http://` + window.location.hostname + `:3000/api/blocked/${this.id}`,
      type: "DELETE",
      success: () => {
        toasts.notifySuccess(`You just unblocked ${this.get("username")}`);
        this.set("blocked", false);
        window.chat.trigger("block");
      },
      error: () =>
        toasts.notifyError(`Could not unblock ${this.get("username")}`),
    });
  },
  banUntil(time) {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/users/${this.id}`,
      type: "PUT",
      data: { banned_until: time },
      success: () => {
        toasts.notifySuccess(
          `You just banned ${this.escape("username")} for ${time} minutes`
        );
        this.set("banned", true);
      },
      error: () =>
        toasts.notifyError(`Could not ban ${this.escape("username")}`),
    });
  },
  askGame(notif) {
    $.ajax({
      url: `http://` + window.location.hostname + `:3000/api/game_requests/`,
      type: "POST",
      data: `userid=${window.currentUser.get("id")}&opponentid=${this.get(
        "id"
      )}`,
      success: () => {
        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "game_request",
              content: {
                request_to: this.get("id"),
                from: {
                  id: window.currentUser.get("id"),
                  login: window.currentUser.get("login"),
                },
              },
            },
          },
          true,
          true
        );
        toasts.notifySuccess("Game Request send.");
      },
      error: (err) => {
        toasts.notifyError("Cannot send a game request.");
        console.log("Ask game user error: ", err);
      },
    });
  },
  acceptGame(game_request_id) {
    $.ajax({
      url:
        `http://` +
        window.location.hostname +
        `:3000/api/game_requests/${game_request_id}`,
      type: "PUT",
      data: `opponentid=${window.currentUser.id}&userid=${this.get("id")}`,
      success: () => {
        if (this.get("login"))
          toasts.notifySuccess(`${this.get("login")} game request accepted.`);
        else toasts.notifySuccess(`Start game!`);

        fetch(`http://` + window.location.hostname + `:3000/api/game_rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookies.get("user"),
          },
          body: JSON.stringify({
            player_id: window.currentUser.get("id"),
            opponent_id: this.get("id"),
            status: "notstarted",
            game_type: "direct",
            number_player: 0,
          }),
        })
          .then((res) => res.json())
          .then((createResult) => {
            //tmp
            if (createResult == null) {
              toasts.notifyError("Error during game creation.");
              return;
            }

            window.globalSocket.sendMessage(
              {
                action: "to_broadcast",
                infos: {
                  message: "game_request_reply",
                  content: {
                    request_to: this.get("id"),
                    from: {
                      id: window.currentUser.get("id"),
                      login: window.currentUser.get("login"),
                    },
                    gameid: createResult.id,
                  },
                },
              },
              false,
              true
            );

            window.location.hash = "game_live/" + createResult.id;
          });

        window.currentUser.fetch();
      },
      error: (err) => {
        console.log("Accept game error: ", err);
        toasts.notifyError("An error occured.");
      },
    });
  },
  findLadderGame() {
    $.ajax({
      url: `http://${window.location.hostname}:3000/api/ladder_games`,
      type: "POST",
      success: (data) => {
        toasts.notifySuccess(
          `Ladder game request sent to ${data.opponent.login}`
        );
      },
      error: (data) => {
        console.log("Find lagger game error: ", data);
        toasts.notifyError(data.responseJSON.error);
      },
    });
  },
  acceptWarGame() {
    $.ajax({
      url: `http://${window.location.hostname}:3000/api/wars/${
        window.currentUser.get("guild").present_war_id
      }/wt_game_accept`,
      type: "POST",
      success: (data) => {
        toasts.notifySuccess("Nice game start");

        window.currentUser.fetch();

        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "game_request_reply",
              content: {
                request_to: data.opponent.id,
                from: {
                  id: window.currentUser.get("id"),
                  login: window.currentUser.get("login"),
                },
                gameid: data.id,
              },
            },
          },
          false,
          true
        );

        window.location.hash = "game_live/" + data.id;
      },
      error: (err) => {
        toasts.notifyError(JSON.parse(err.responseText).error);
      },
    });
  },
  changeStatus(statu) {
    $.ajax({
      url:
        `http://` +
        window.location.hostname +
        `:3000/api/users/${this.id}/change_status`,
      type: "POST",
      data: { status: statu },
      success: () => {
        this.set("status", statu);
        window.globalSocket.sendMessage(
          {
            action: "to_broadcast",
            infos: {
              message: "new_client",
              sender: window.currentUser.get("id"),
              content: { desc: "Changement status", status: statu },
            },
          },
          false,
          true
        );
      },
    });
  },
});

const Users = Backbone.Collection.extend({
  model: User,
  url: "http://" + window.location.hostname + ":3000/api/users?limit=20",
  // parse: function (data) {
  // 	data.forEach(el => {
  // 		this.add(new User(el));
  // 	});
  // }
});

const Friends = Backbone.Collection.extend({});

export { User, Friends, Users, UserGames };
