watchpocket = {};

watchpocket.post = function (url, data, successHandler, errorHandler) {
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

watchpocket.loadBookmarks = function(el, query, sort) {
	var params = {
		consumer_key: watchpocket.consumerKey,
		access_token: localStorage.oAuthAccessToken,
		sort: 'oldest',
		state: 'unread'
	}
	el.css('opacity', '0.3');
	if (query) {
		params['search'] = query;
	}
	if (sort) {
		params['sort'] = sort;
	}
	watchpocket.post(
		'https://getpocket.com/v3/get',
		JSON.stringify(params),
		function (xhr) {
			$('h3.bookmarksTitle', el).show();
			$('.bookmarksSearch', el).show();
			var response = JSON.parse(xhr.responseText);
			var html = '';
			$.each(response.list, function(i, d) {
				if (d.given_url) {
					var url = d.given_url.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?/i);
					var icon = 'https://web-image.appspot.com/?url=' + d.given_url;
					if (url) {
						url = url[3];
					}
					else {
						url = '';
					}
					var excerpt = '';
					if (d.excerpt) {
						excerpt = 'data-original-title="' + d.excerpt.substr(0, 120) + '..."';
					}
					html += '<tr rel="tooltip" data-url="' + d.given_url + '" ' + excerpt + '><td class="favicon"><img src="' + icon + '" /></td>' +
						'<td class="title"><span class="data">' + d.resolved_title + '</span><span class="domain">' + url + '</span></td></tr>';
				}
			});
			$('.bookmarksSearch input', el).focus();
			$('tbody', el).html(html);
			el.css('opacity', '1.0');
		}
	);
};

watchpocket.add = function(url) {
	var params = {
		consumer_key: watchpocket.consumerKey,
		access_token: localStorage.oAuthAccessToken,
		url: url
	}
	watchpocket.post('https://getpocket.com/v3/add', JSON.stringify(params));
};

$(function() {
	chrome.contextMenus.create({
		title: 'Watchpocket',
		contexts : ['page'],
		onclick: function(info, tab) {
			watchpocket.add(tab.url);
		}
	});
});