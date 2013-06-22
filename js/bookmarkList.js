watchpocket = window.watchpocket || chrome.extension.getBackgroundPage().watchpocket;

$(function() {
	watchpocket.loadBookmarks($('#bookmarks'));
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
    $('.bookmarksSort').on('click', 'button', function(){
        watchpocket.order = $(this).attr('value');
        search();
    });
	function search() {
		watchpocket.loadBookmarks($('#bookmarks'), $('.bookmarksSearch input').val(), watchpocket.order);
	}
	$('body').tooltip({
        selector: "[rel=tooltip]",
        placement: 'top'
    });
});