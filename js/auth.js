$(function() {
	if (location.search == '?status=done' && localStorage.oAuthRequestToken) {
		watchpocket.getAccessToken();
	}
});