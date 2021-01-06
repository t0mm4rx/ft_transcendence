import { User } from '../models/User';
import Cookies from 'js-cookie';

const loadCurrentUser = () => {
	if (window.currentUser.status !== 200 && !!Cookies.get('user'))
		window.currentUser.fetch();
}

export {loadCurrentUser};