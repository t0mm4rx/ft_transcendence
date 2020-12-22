/* Send toast to inform the user of the application state. */
import Toastify from 'toastify-js';

const DURATION = 15;

export default {
	notifyError: message => {
		Toastify({
			text: `Error: ${message}`,
			className: "toast-error",
			position: "center",
			duration: DURATION * 1000,
			close: true
		}).showToast();
	},
	notifySuccess: message => {
		Toastify({
			text: `${message}`,
			className: "toast-success",
			position: "center",
			duration: DURATION * 1000,
			close: true
		}).showToast();
	}
};