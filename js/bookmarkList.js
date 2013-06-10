$(function() {
	if (!watchpocket.isLoggedIn()) {
		document.location.href = watchpocket.loginUrl;
	}
	else {
		watchpocket.loadBookmarks('#bookmarks tbody');
	}
	$('#bookmarks').on('click', 'tr', function() {
		chrome.tabs.create({url: $(this).data('url')});
	});
});