$(function() {
	var el = $('<div />').css({
		position: 'fixed',
		right: 0,
		bottom: '50px',
		width: '60px',
		height: '60px',
		background: '#fff',
		'z-index': 12000,
		'border-radius': '12px 0 0 12px',
		'box-shadow': '0 0 30px #888'
	});
	$('body').append(el);
});

var showBookmarkMessage = function() {
	var el = $('<div />').css({
		position: 'fixed',
		left: 0,
		right: 0,
		top: 0,
		width: '100%',
		height: '200px',
		background: '#c04912',
		display: 'none',
		'z-index': 12000,
		color: '#fff',
		'text-align': 'center',
		'line-height': '200px'
	});
	var text = $('<h1>Successfully bookmarked!!!</h1>').css({
		margin: 0,
		padding: 0,
		'font-size': '50px'
	});
	el.append(text);
	$('body').append(el);
	el.fadeIn();
	setTimeout(function() {
		el.fadeOut(function() {
			el.remove();
		});
	}, 5000);
};