watchpocket = window.watchpocket || chrome.extension.getBackgroundPage().watchpocket;

var order = 'newest';

function search() {
	watchpocket.loadBookmarks($('#bookmarks'), $('.bookmarksSearch input').val(), order);
}

$(function() {
	search();
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
        order = $(this).attr('value');
        search();
    });

	$('body').tooltip({
        selector: "[rel=tooltip]",
        placement: 'top'
    });
});