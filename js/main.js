watchpocket = {};

watchpocket.post = function(url, data, successHandler, errorHandler) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			if (successHandler) {
				successHandler(this);
			}
		}
		else if (this.readyState === 4 && this.status === 401) {
			watchpocket.getRequestToken();
		}
	};
	xhr.open('POST', url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF8");
	xhr.setRequestHeader("X-Accept", "application/json");
	xhr.send(data || null);
};

watchpocket.getRequestToken = function() {
	watchpocket.post(
		'https://getpocket.com/v3/oauth/request',
		JSON.stringify({
			'consumer_key' : watchpocket.consumerKey,
			'redirect_uri' : chrome.extension.getURL('auth.html') + '?status=done'
		}),
		function (xhr) {
			var response = JSON.parse(xhr.responseText);
			localStorage.oAuthRequestToken = response.code;
			watchpocket.getAuthorization(response.code);
		}
	);
};

watchpocket.getAuthorization = function(requestToken) {
	var url = [
		'https://getpocket.com/auth/authorize?request_token=',
		requestToken,
		'&redirect_uri=',
		chrome.extension.getURL('auth.html') + '?status=done'
	].join('');
	chrome.tabs.create({url: url});
};

watchpocket.getAccessToken = function(callback) {
	watchpocket.post(
		'https://getpocket.com/v3/oauth/authorize',
		JSON.stringify({
			'consumer_key' : watchpocket.consumerKey,
			'code'         : localStorage.oAuthRequestToken
		}),
		function (xhr) {
			var response = JSON.parse(xhr.responseText);
			localStorage.oAuthAccessToken = response.access_token;
			if (callback) callback();
		}
	);
};

watchpocket.consumerKey = '15125-5b0f6fea981d25edb7d399cd';


watchpocket.isLoggedIn = function() {
	return (localStorage.oAuthAccessToken) ? true : false;
};

watchpocket.loadBookmarks = function(selector, query) {
	var params = {
		'consumer_key' : watchpocket.consumerKey,
		'access_token' : localStorage.oAuthAccessToken
	}
	var el = $(selector);
	el.css('opacity', '0.3');
	if (query) {
		params['search'] = query;
	}
	watchpocket.post(
		'https://getpocket.com/v3/get',
		JSON.stringify(params),
		function (xhr) {
			$('h3.bookmarksTitle, .bookmarksSearch').show();
			var response = JSON.parse(xhr.responseText);
			var html = '';
			$.each(response.list, function(i, d) {
				if (d.resolved_url) {
					var icon = 'https://getfavicon.appspot.com/' + d.resolved_url;
					var url = d.resolved_url.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/[\w/-]+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/i);
					if (url) {
						url = url[3];
					}
					else {
						url = '';
					}
					html += '<tr data-url="' + d.resolved_url + '"><td class="favicon"><img src="' + icon + '" /></td>' +
						'<td class="title"><span class="data">' + d.resolved_title + '</span><span class="domain">' + url + '</span></td></tr>';
				}
			});
			$('.bookmarksSearch input').focus();
			el.html(html).css('opacity', '1.0');
		}
	);
};

$(function() {
	$('#closeTab').click(function(e) {
		e.preventDefault();
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.remove(tab.id);
		});
		return false;
	});
});