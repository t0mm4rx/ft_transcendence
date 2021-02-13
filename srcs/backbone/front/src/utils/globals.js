import Cookies from "js-cookie";

const loadCurrentUser = (
  success = () => {
    globalSocket.sendMessage(
      {
        action: "to_broadcast",
        infos: {
          message: "new_client",
          content: {},
        },
      },
      false,
      true
    );
  },
  error = (data, state) => {
    console.log(state.responseJSON.error);
  }
) => {
  if (window.currentUser.status !== 200 && !!Cookies.get("user"))
    window.currentUser.fetch({
      success: success,
      error: error,
    });
};

const loadUsers = () => {
  if (window.users.status !== 200 && !!Cookies.get("user"))
    window.users.fetch();
};

const loadGuilds = () => {
  if (window.guilds.status !== 200 && !!Cookies.get("user"))
    window.guilds.fetch();
};

const loadWars = () => {
	if (window.wars.status !== 200 && !!Cookies.get("user"))
		window.wars.fetch();
};

const logout = () => {
  Cookies.remove("user");
  window.location.reload();
};

export { loadCurrentUser, loadUsers, loadGuilds, logout, loadWars };
