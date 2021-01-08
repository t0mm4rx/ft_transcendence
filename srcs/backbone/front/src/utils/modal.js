import $ from 'jquery';

const showModal = (title, content, onAccept, onDismiss) => {
	const close = () => {
		$(document).off("click", "#modal-cancel");
		$(document).off("click", "#modal-ok");
		$(document).off("click", ".modal-close > svg");
		$(".modal-overlay").remove();
	}
	const modal = `<div class="modal-overlay">
		<div class="panel modal">
			<div class="modal-close"><i class="fas fa-times"></i></div>
			<div class="panel-header"><span>${title}</span></div>
			${content}
			<div class="modal-controls">
				<div class="button button-grey" id="modal-cancel">Cancel</div>
				<div class="button" id="modal-ok">Ok!</div>
			</div>
		</div>
	</div>`;
	$(document).on("click", ".modal-close > svg", () => {
		onDismiss();
		close();
	});
	$(document).on("click", "#modal-ok", () => {
		if (onAccept()) {
			close();
		}
	});
	$(document).on("click", "#modal-cancel", () => {
		onDismiss();
		close();
	});
	$("body").append(modal);
}

export {showModal};