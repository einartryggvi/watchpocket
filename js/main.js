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

watchpocket.loadBookmarks = function(el, query, sort, state) {
	var params = {
		consumer_key: watchpocket.consumerKey,
		access_token: localStorage.oAuthAccessToken
	}
	el.css('opacity', '0.3');
	if (query) {
		params['search'] = query;
	}
    if (sort) {
        params['sort'] = sort;
    }
    if (state) {
        params['state'] = state;
    }
	watchpocket.post(
		'https://getpocket.com/v3/get',
		JSON.stringify(params),
		function (xhr) {
			$('h3.bookmarksTitle', el).show();
            $('.bookmarksSort', el).show();
            $('.bookmarksState', el).show();
			$('.bookmarksSearch', el).show();
			var list = JSON.parse(xhr.responseText).list;
			var items = [];
			$.each(list, function(i, d) {
				// Real URL is preferably the resolved URL but could be the given URL
				var realURL = d.resolved_url || d.given_url;
				// If neither resolved or given URL the item isn't worthwhile showing
				if (realURL) {
                    var id = d.item_id;
					// Regular expression to parse out the domain name of the URL, or an empty string if something fails
					var domain = realURL.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?/i)[3] || '';
					// Fetches a icon from a great webservice which provides a default fallback icon
					var icon = 'https://web-image.appspot.com/?url=' + realURL;
                    //var icon = 'img/icon.png';
					// Show the shortened excerpt as a tooltip
					var excerpt = '';
					if (d.excerpt) {
						excerpt = 'data-original-title="' + d.excerpt.substr(0, 120) + '..."';
					}
					// Create a data object and push it to the items array
					items.push({
                        id: id,
						url: realURL,
						title: d.resolved_title || d.given_title,
						excerpt: excerpt,
						icon: icon,
						domain: domain,
						added: d.time_added
					});
				}
			});

			var newestSort = function(a, b) {
				var aTime = parseInt(a.added);
				var bTime = parseInt(b.added);
				if (aTime < bTime)
					return 1;
				if (aTime > bTime)
					return -1;
				return 0;
			};

			var oldestSort = function(a, b) {
				var aTime = parseInt(a.added);
				var bTime = parseInt(b.added);
				if (aTime < bTime)
					return -1;
				if (aTime > bTime)
					return 1;
				return 0;
			};

			var titleSort = function(a, b) {
				if (a.title < b.title)
					return -1;
				if (a.title > b.title)
					return 1;
				return 0;
			};

			var siteSort = function(a, b) {
				if (a.domain < b.domain)
					return -1;
				if (a.domain > b.domain)
					return 1;
				return 0;
			};

			if (params.sort === 'oldest') {
				items = items.sort(oldestSort);
			}
			else if (params.sort === 'title') {
				items = items.sort(titleSort);
			}
            else if (params.sort === 'site') {
				items = items.sort(siteSort);
			}
			else {
				items = items.sort(newestSort);
			}

			var html = '';
			// Iterate through the reversed items array to get newest items at the top
			$.each(items, function(i, d) {
				html += '<tr id="' + d.id + '" rel="tooltip" data-url="' + d.url + '" ' + d.excerpt + '><td class="favicon"><img src="' + d.icon + '" /></td>' +
						'<td class="title"><span class="data">' + d.title + '</span><span class="domain">' + d.domain + '</span>' +
					'<span class="actions"><i class="icon-ok"></i><i class="icon-heart"></i><i class="icon-trash"></i></span></td></tr>';
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
	};
	watchpocket.post('https://getpocket.com/v3/add', JSON.stringify(params), function() {
		 chrome.tabs.executeScript(null, {code:"showBookmarkMessage();"});
	});
};

watchpocket.send = function(method, id) {
	var params = {
		consumer_key: watchpocket.consumerKey,
		access_token: localStorage.oAuthAccessToken,
		actions: [{'action': method, 'item_id': id}]
	};
	watchpocket.post('https://getpocket.com/v3/send', JSON.stringify(params));
};

$(function() {
	chrome.contextMenus.create({
		title: 'Add to Pocket',
		contexts : ['page'],
		onclick: function(info, tab) {
			watchpocket.add(tab.url);
		}
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.command === 'addBookmark' && request.url) {
			watchpocket.add(request.url);
		}
	});
});
