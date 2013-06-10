$(function() {
	watchpocket.loadBookmarks('#bookmarks tbody');
	$('#bookmarks').on('click', 'tr', function() {
		chrome.tabs.create({url: $(this).data('url')});
	});
});