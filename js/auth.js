watchpocket = window.watchpocket || chrome.extension.getBackgroundPage().watchpocket;

$(function() {
	if (location.search == '?status=done' && localStorage.oAuthRequestToken) {
		watchpocket.getAccessToken();
	}
	$('#closeTab').click(function(e) {
		e.preventDefault();
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.remove(tab.id);
		});
		return false;
	});
});
