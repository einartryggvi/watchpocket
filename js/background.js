$(function() {
	chrome.contextMenus.create({
		title: 'Watchpocket',
		contexts : ['page'],
		onclick: function(info, tab) {
			console.log(tab.url);
		}
	});
});