$(function() {
	var imgURL = chrome.extension.getURL('img/appIcon.png');
	var el = $('<div />').css({
		position: 'fixed',
		right: 0,
		bottom: '50px',
		width: '60px',
		height: '60px',
		background: 'url('+imgURL+') no-repeat #fff',
		'background-size': '50px',
		'background-position': 'center',
		'z-index': 12000,
		'border-radius': '12px 0 0 12px',
		'box-shadow': '0 0 30px #888',
		cursor: 'pointer',
		opacity: '0.3'
	});
	el.click(function() {
		chrome.runtime.sendMessage({command: "addBookmark", url: window.location.href});
	});
	el.hover(function() {
		$(this).css('opacity', '1');
	}, function() {
		$(this).css('opacity', '0.3');
	});
	$('body').append(el);
});

var showBookmarkMessage = function() {
	$.get(chrome.extension.getURL('notification.html'), function(d) {
		var el = $(d);
		$('body').append(el);
		setTimeout(function() {
			el.css({
				'visibility': 'visible',
				'transform': 'translate3d(0px, 0px, 0px)'
			});
		}, 100);
		setTimeout(function() {
			el.css({
				'transform': 'translate3d(0px, -100px, 0px)'
			});
		}, 4000);
		setTimeout(function() {
			el.fadeOut(function() {
				el.remove();
			});
		}, 5000);
	});
};