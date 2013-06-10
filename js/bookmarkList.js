$(function() {
	watchpocket.loadBookmarks('#bookmarks tbody');
	$('#bookmarks').on('click', 'tr', function() {
		chrome.tabs.create({url: $(this).data('url')});
	});
	$('.bookmarksSearch button').click(function() {
		search();
	});
	$('.bookmarksSearch input').keydown(function(e) {
		if (e.keyCode == '13') {
			search();
		}
	});
	function search() {
		watchpocket.loadBookmarks('#bookmarks tbody', $('.bookmarksSearch input').val());
	}
});