watchpocket = window.watchpocket || chrome.extension.getBackgroundPage().watchpocket;

var sort = 'newest';
var state = 'unread';

function search() {
	watchpocket.loadBookmarks($('#bookmarks'), $('.bookmarksSearch input').val(), sort, state);
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
        sort = $(this).attr('value');
        search();
    });
    $('.bookmarksState').on('click', 'button', function(){
        state = $(this).attr('value');
        search();
    });
	$('body').tooltip({
        selector: "[rel=tooltip]",
        placement: 'top'
    });
	chrome.time.getTime("%d/%m/%Y", function(d) {
		$("#time").html(d.timeString);
	});
});
