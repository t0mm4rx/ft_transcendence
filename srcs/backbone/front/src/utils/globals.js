import Cookies from 'js-cookie';

const loadCurrentUser = () => {
	if (window.currentUser.status !== 200 && !!Cookies.get('user'))
		window.currentUser.fetch();
}

const loadUsers = () => {
	if (window.users.status !== 200 && !!Cookies.get('user'))
		window.users.fetch();
}

const logout = () => {
	Cookies.remove('user');
	window.location.reload();
}

export {loadCurrentUser, loadUsers, logout};