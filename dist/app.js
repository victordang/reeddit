(function() {
'use strict';
/* global
 El,
 UI,
 is
 */

var Anim = (function () {

	var slideFromLeft = function slideFromLeft() {
		var show = UI.classes.showView;
		UI.el.mainView.addClass(show);
		UI.el.detailView.removeClass(show);
		UI.setCurrentView(UI.View.MAIN);
	};

	var slideFromRight = function slideFromRight() {
		var show = UI.classes.showView;
		UI.el.mainView.removeClass(show);
		UI.el.detailView.addClass(show);
		UI.setCurrentView(UI.View.COMMENTS);
	};

	var reveal = function reveal(el) {
		var reveal = "anim-reveal";
		if (is.desktop) {
			el.addClass(reveal);
			setTimeout(function () {
				el.removeClass(reveal);
			}, 700);
		} else {
			setTimeout(function () {
				el.removeClass(UI.classes.invisible).addClass(reveal);
			}, 0);
		}
	};

	var shake = function shake(el) {
		var shake = "anim-shake";
		el.addClass(shake);
		setTimeout(function () {
			el.removeClass(shake);
		}, 350);
	};

	var shakeForm = function shakeForm() {
		shake($(".new-form"));
	};

	var bounceOut = function bounceOut(el, callback) {
		var bounceOut = "anim-bounce-out";
		el.addClass(bounceOut);
		if (callback) {
			setTimeout(callback, 1000);
		}
	};

	var bounceInDown = function bounceInDown(el) {
		el.addClass("anim-bounceInDown");
		setTimeout(function () {
			el[0].style.opacity = 1;
			el.removeClass("anim-bounceInDown");
		}, 500);
	};

	// Exports
	return {
		slideFromLeft: slideFromLeft,
		slideFromRight: slideFromRight,
		reveal: reveal,
		shake: shake,
		shakeForm: shakeForm,
		bounceOut: bounceOut,
		bounceInDown: bounceInDown
	};
})();

var $$ = {

	id: function id(query) {
		return document.getElementById(query);
	},

	q: function q(query) {
		return document.querySelector(query);
	}
};

var wideScreenBP = window.matchMedia("(min-width: 1000px)");
var largeScreenBP = window.matchMedia("(min-width: 490px)");
var UA = window.navigator.userAgent;

var is = (function () {

  // Do detection
  var isDesktop = !/iPhone|iPod|iPad|Android|Mobile/.test(UA);
  var isiPad = /iPad/.test(UA);
  var isiPhone = /iP(hone|od)/.test(UA);
  var isiOS = isiPhone || isiPad;

  var iOSversion = (function () {
    if (!isiOS) {
      return 0;
    }
    return parseInt(UA.match(/ OS (\d+)_/i)[1], 10);
  })();

  return {
    wideScreen: wideScreenBP.matches,
    largeScreen: largeScreenBP.matches,
    desktop: isDesktop,
    mobile: !isDesktop,
    iPhone: isiPhone,
    iPad: isiPad,
    iOS: isiOS,
    iOS7: isiOS && iOSversion >= 7
  };
})();

/* global allCookies */
var Store = window.fluid ? allCookies : window.localStorage;

/* global
 Store,
 UI,
 is
 */

var ThemeSwitcher = (function () {

	var themes = ['classic', 'light', 'dark'];

	var currentThemeIndex = 0;

	var el = {
		switcherButton: $('#switch-theme')
	};

	var switchTheme = function switchTheme() {
		var current = getCurrentTheme(),
		    next = getNextTheme();

		UI.el.body.removeClass(current);
		setTheme(next);
	};

	var setTheme = function setTheme(theme) {
		UI.el.body.addClass(theme);
		setThemeLabel(theme);
		saveTheme(theme);
	};

	var setThemeLabel = function setThemeLabel(name) {
		el.switcherButton.text('Theme: ' + name);
	};

	var getCurrentTheme = function getCurrentTheme() {
		return themes[currentThemeIndex];
	};

	var getNextTheme = function getNextTheme() {
		currentThemeIndex++;

		if (currentThemeIndex === themes.length) {
			currentThemeIndex = 0;
		}

		return themes[currentThemeIndex];
	};

	var saveTheme = function saveTheme(theme) {
		Store.setItem('theme', theme);
	};

	var loadTheme = function loadTheme() {
		return Store.getItem('theme');
	};

	var loadInitialTheme = function loadInitialTheme() {
		var initial = loadTheme();

		if (initial) {
			updateTheme(initial);
		} else if (is.iOS7) {
			setTheme(themes[1]);
		} else {
			setTheme(themes[currentThemeIndex]);
		}
	};

	var updateTheme = function updateTheme(theme) {
		if (getCurrentTheme() === theme) {
			return;
		}
		setTheme(theme);
		currentThemeIndex = themes.indexOf(theme);
	};

	var init = function init() {
		loadInitialTheme();
		// Listeners
		el.switcherButton.on('click', function (ev) {
			ev.preventDefault();
			switchTheme();
		});
	};

	// Exports
	return {
		init: init
	};
})();

/* global
 $,
 $$,
 El,
 Anim,
 Footer,
 Header,
 Store,
 Menu,
 Modal,
 Posts,
 Comments,
 is,
 wideScreenBP,
 largeScreenBP
 */

var UI = (function () {

	var Move = {
		LEFT: 1,
		RIGHT: 2
	};

	var View = {
		MAIN: 1,
		COMMENTS: 2
	};

	var classes = { // css
		showView: "show-view",
		showMenu: "show-menu",
		mnml: "mnml",
		hide: "hide",
		swipe: 'from-swipe',
		invisible: 'invisible'
	};

	var keyCode = {
		MENU: 49, // 1
		MAIN: 50, // 2
		DETAIL: 51 // 3
	};

	var template = {
		loader: "<div class='loader'></div>",
		closeModalButton: "<a href='#close' class='close-form no-ndrln txt-cntr txt-bld'>&times;</a>"
	};

	var el = {
		body: $('body'),
		mainWrap: $('#main-wrap'),
		detailWrap: $('#detail-wrap'),
		mainView: $('.main-view'),
		detailView: $('.detail-view')
	};

	var currentView = View.MAIN;

	var getCurrentView = function getCurrentView() {
		return currentView;
	};

	var setCurrentView = function setCurrentView(view) {
		currentView = view;
	};

	var setSubTitle = function setSubTitle(title) {
		Header.el.subtitleText.text('☰ ' + title);
		Footer.el.subTitle.text(title);
	};

	var backToMainView = function backToMainView() {
		Header.el.btnNavBack.addClass(classes.invisible);
		Header.el.subtitle.removeClass(classes.invisible);
		Header.el.centerSection.empty().append(Header.el.icon);
		Anim.slideFromLeft();
	};

	var switchDisplay = function switchDisplay(el, visible) {
		if (visible) {
			el.classList.add(classes.hide);
		} else {
			el.classList.remove(classes.hide);
		}
	};

	var addLoader = function addLoader(elem) {
		var loader = $("<div/>").addClass("loader");
		elem.append(loader);
		return loader;
	};

	var scrollFixLinks = function scrollFixLinks() {
		// Make links section always scrollable / Necessary when using the other Sorting options.
		var totalHeight = 0;
		// Calculate the total of link wrappers height
		var wraps = document.querySelectorAll('.link-wrap');
		for (var w = 0; w < wraps.length; w++) {
			totalHeight += wraps[w].offsetHeight;
		}
		// Get each element's static section height
		var containerHeight = document.body.offsetHeight,
		    headerHeight = $$.q('header').offsetHeight,
		    message = $$.q('.loader'),
		    messageHeight = message ? message.offsetHeight : 0;

		var minHeight = containerHeight - headerHeight - messageHeight;

		if (totalHeight > minHeight) {
			$("#main-overflow").css('min-height', '');
		} else {
			$("#main-overflow").css('min-height', minHeight - totalHeight + 1);
		}
	};

	var supportOrientation = typeof window.orientation !== 'undefined';

	var getScrollTop = function getScrollTop() {
		return window.pageYOffset || document.compatMode === 'CSS1Compat' && document.documentElement.scrollTop || document.body.scrollTop || 0;
	};

	var scrollTop = function scrollTop() {
		if (!supportOrientation) {
			return;
		}
		document.body.style.height = screen.height + 'px';
		setTimeout(function () {
			window.scrollTo(0, 1);
			var top = getScrollTop();
			window.scrollTo(0, top === 1 ? 0 : 1);
			document.body.style.height = window.innerHeight + 'px';
		}, 1);
	};

	var iPadScrollFix = function iPadScrollFix() {
		// This slight height change makes the menu container 'overflowy', to allow scrolling again on iPad - weird bug
		var nextHeight = '36px' === $('.menu-desc').css('height') ? '35px' : '36px';
		setTimeout(function () {
			$('.menu-desc').css('height', nextHeight);
		}, 500);
	};

	var initListeners = function initListeners() {

		// Show option to reload app after update
		if (window.applicationCache) {
			window.applicationCache.addEventListener("updateready", function () {
				var delay = 1;
				if (Menu.isShowing()) {
					Menu.move(Move.LEFT);
					delay = 301;
				}
				setTimeout(function () {
					el.mainWrap.prepend("<button class='btn blck mrgn-cntr-x mrgn-y' id='btn-update' onclick='window.location.reload();'>Reeddit updated. Press to reload</button>");
				}, delay);
			}, false);
		}

		// Do stuff after finishing resizing the windows
		window.addEventListener("resizeend", function () {
			is.wideScreen = wideScreenBP.matches;
			is.largeScreen = largeScreenBP.matches;
			scrollTop();
			if (is.largeScreen && Menu.isShowing()) {
				Menu.move(Move.LEFT);
			}
			if (is.iPad) {
				iPadScrollFix();
			}
		}, false);

		if (is.iPhone && is.iOS7) {
			var hasSwiped = false;
			document.addEventListener('touchstart', function (ev) {
				var touchX = ev.targetTouches[0].clientX;
				hasSwiped = touchX < 20 || touchX > window.innerWidth - 20;
			});
			document.addEventListener('touchend', function () {
				hasSwiped = false;
			});
		}

		// Pseudo-hash-router
		window.addEventListener('hashchange', function () {
			if (is.iPhone && is.iOS7) {
				// Switch `transition-duration` class,
				// to stop animation when swiping
				if (hasSwiped) {
					el.mainView.addClass(classes.swipe);
					el.detailView.addClass(classes.swipe);
					Header.el.btnNavBack.addClass(classes.swipe);
					Header.el.subtitle.addClass(classes.swipe);
				} else {
					el.mainView.removeClass(classes.swipe);
					el.detailView.removeClass(classes.swipe);
					Header.el.btnNavBack.removeClass(classes.swipe);
					Header.el.subtitle.removeClass(classes.swipe);
				}
				hasSwiped = false;
			}
			// Handle Hash Changes
			if (location.hash === "") {
				// To Main View
				backToMainView();
				Posts.clearSelected();
				Footer.setPostTitle();
				setTimeout(function () {
					el.detailWrap.empty();
				}, is.wideScreen ? 1 : 301);
			} else {
				// To Comment View
				Comments.navigateFromHash();
			}
		}, false);

		// Presses

		UI.el.body.on('click', '.js-btn-refresh', function (ev) {
			ev.preventDefault();
			var origin = this.dataset.origin;
			switch (origin) {
				case 'footer-main':
					Posts.refreshStream();
					break;
				case 'footer-detail':
					if (!Comments.getCurrentThread()) {
						return;
					}
					Comments.show(Comments.getCurrentThread(), true);
					break;
				default:
					if (currentView === View.COMMENTS) {
						if (!Comments.getCurrentThread()) {
							return;
						}
						Comments.show(Comments.getCurrentThread(), true);
					}
					if (currentView === View.MAIN) {
						Posts.refreshStream();
					}
			}
		});

		el.body.on('click', '.close-form', function (ev) {
			ev.preventDefault();
			Modal.remove();
		});

		// Swipes
		if (is.mobile) {
			if (!(is.iPhone && is.iOS7)) {
				el.detailView.swipeRight(function () {
					if (is.wideScreen) {
						return;
					}
					location.hash = "#";
				});
			}

			el.mainView.swipeRight(function () {
				if (!is.desktop && Posts.areLoading() || is.largeScreen) {
					return;
				}
				if (currentView === View.MAIN) {
					Menu.move(Move.RIGHT);
				}
			});

			el.mainView.swipeLeft(function () {
				if (!is.desktop && Posts.areLoading() || is.largeScreen) {
					return;
				}
				if (Menu.isShowing()) {
					Menu.move(Move.LEFT);
				}
			});

			el.mainView.on("swipeLeft", ".link", function () {
				if (is.wideScreen) {
					return;
				}
				if (!Menu.isShowing()) {
					var id = $(this).data("id");
					Comments.updateHash(id);
				}
			});
		}

		// Keys

		el.body.on('keydown', function (ev) {

			if (Modal.isShowing()) {
				return;
			}

			switch (ev.which) {
				case keyCode.MENU:
					if (!is.largeScreen) {
						// Mobile
						if (getCurrentView() === View.MAIN) {
							Menu.move(Move.RIGHT);
						} else {
							return;
						}
					}
					Menu.el.mainMenu.focus();
					break;
				case keyCode.MAIN:
					if (!is.largeScreen) {
						// Mobile
						if (getCurrentView() === View.MAIN) {
							Menu.move(Move.LEFT);
						} else {
							window.location.hash = '';
						}
					} else if (!is.wideScreen && getCurrentView() === View.COMMENTS) {
						window.location.hash = '';
					}
					el.mainWrap.focus();
					break;
				case keyCode.DETAIL:
					if (!is.largeScreen && getCurrentView() === View.MAIN) {
						return;
					}
					el.detailWrap.focus();
					break;
			}
		});
	};

	// Exports
	return {
		el: el,
		classes: classes,
		View: View,
		Move: Move,
		template: template,
		initListeners: initListeners,
		setCurrentView: setCurrentView,
		getCurrentView: getCurrentView,
		setSubTitle: setSubTitle,
		scrollTop: scrollTop,
		iPadScrollFix: iPadScrollFix,
		scrollFixLinks: scrollFixLinks,
		addLoader: addLoader,
		backToMainView: backToMainView,
		switchDisplay: switchDisplay
	};
})();

var URLs = {
  init: window.location.protocol + '//www.reddit.com/',
  end: '.json?jsonp=?',
  limitEnd: '.json?limit=30&jsonp=?'
};

/* global
 $,
 $$,
 is,
 UI,
 Modal,
 Store
 */

var Backup = (function () {

	var update = 1;

	var el = {
		buttonExportData: $('#exp-data'),
		buttonImportData: $('#imp-data')
	};

	var template = {
		exportData: '\n\t\t<div class=\'new-form move-data\'>\n\t\t\t' + UI.template.closeModalButton + '\n\t\t\t<div class=\'move-data-exp\'>\n\t\t\t\t<h3>Export Data</h3>\n\t\t\t\t<p>You can back-up your local subscriptions and then import them to any other Reeddit instance, or just restore them.</p>\n\t\t\t\t<a class="btn no-ndrln txt-cntr blck w-100 mrgn-y pad-y"\n\t\t\t\t   id="btn-download-data"\n\t\t\t\t   download="reedditdata.json">Download Data</a>\n\t\t\t</div>\n\t\t</div>',
		importData: '\n\t\t<div class=\'new-form move-data\'>\n\t\t\t' + UI.template.closeModalButton + '\n\t\t\t<div class=\'move-data-imp\'>\n\t\t\t\t<h3>Import Data</h3>\n\t\t\t\t<p>Load the subscriptions from another Reeddit instance.</p>\n\t\t\t\t<p>Once you choose the reeddit data file, Reeddit will refresh with the imported data.</p>\n\t\t\t\t<button class=\'btn w-100 mrgn-y pad-y\'\n\t\t\t\t\t\t    id=\'btn-trigger-file\'>Choose Backup file</button>\n\t\t\t\t<input id=\'file-chooser\'\n\t\t\t\t\t\t\t class="hide"\n\t\t\t\t\t     type="file"\n\t\t\t\t\t     accept="application/json"/>\n\t\t\t</div>\n\t\t</div>'
	};

	var shouldUpdate = function shouldUpdate() {
		update = 1;
	};

	var getBackupData = function getBackupData() {
		return "{\"channels\": " + Store.getItem("channels") + ", \"subreddits\": " + Store.getItem("subreeddits") + "}";
	};

	var prepareDownloadButton = function prepareDownloadButton(data) {
		var buttonDownload = $$.id('btn-download-data');
		buttonDownload.href = "data:text/json;charset=utf-8," + encodeURIComponent(data);
	};

	var createBackup = function createBackup() {
		if (!update) {
			return;
		}

		Modal.show(template.exportData, function () {
			prepareDownloadButton(getBackupData());
		});
	};

	var loadData = function loadData(data) {
		var refresh = false;

		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		if (data.subreddits) {
			refresh = true;
			Store.setItem("subreeddits", JSON.stringify(data.subreddits));
		}
		if (data.channels) {
			refresh = true;
			Store.setItem("channels", JSON.stringify(data.channels));
		}
		if (refresh) {
			window.location.reload();
		}
	};

	var readFile = function readFile(file) {
		var reader = new FileReader();
		reader.onload = function () {
			loadData(reader.result);
		};
		reader.readAsText(file);
	};

	var initListeners = function initListeners() {

		// On Menu
		el.buttonExportData.on('click', function (ev) {
			ev.preventDefault();
			createBackup();
		});

		el.buttonImportData.on('click', function (ev) {
			ev.preventDefault();
			Modal.show(template.importData, function () {
				if (is.iOS) {
					UI.switchDisplay($$.id('btn-trigger-file'), true);
					UI.switchDisplay($$.id('file-chooser'), false);
				}
			});
		});

		// Forms
		UI.el.body.on('change', '#file-chooser', function () {
			var file = this.files[0];
			readFile(file);
		});

		UI.el.body.on('click', '#btn-trigger-file', function () {
			$$.id('file-chooser').click();
		});
	};

	// Exports
	return {
		initListeners: initListeners,
		shouldUpdate: shouldUpdate
	};
})();

/* global
 Posts,
 Subreddits,
 Anim,
 UI,
 Modal,
 is,
 Store,
 Backup,
 CurrentSelection,
 Mustache,
 URLs
 */

var Channels = (function () {

	var defaults = {
		name: "Media",
		subs: ["movies", "television", "music", "games", "books"]
	};

	var singleItemTemplate = '<a href="#{{name}}" class="channel pad-x no-ndrln blck" data-title="{{name}}"><div class="channel__title">{{name}}</div><div class="pad-x">{{#subs}}<div class="channel__sub txt-cap txt-ellps">{{.}}</div>{{/subs}}</div></a>';

	var tmpltButtonAddAnotherSub = '<button class="w-100" id="btn-add-another-sub">Add additional subreddit</button>';

	var template = {
		singleEditItem: "<div class='item-to-edit flx channel-to-remove' data-title='{{name}}'><p class='sub-name w-85 txt-cap txt-bld channel-name'>{{name}}</p><a href='#edit' class='flx flx-cntr-x flx-cntr-y w-15 no-ndrln clr-current btn-edit-channel icon-pencil' data-title='{{name}}'></a><a href='#remove' class='flx flx-cntr-x flx-cntr-y w-15 no-ndrln clr-current btn-remove-channel icon-trashcan' data-title='{{name}}'></a></div>",
		single: singleItemTemplate,
		list: "{{#.}}" + singleItemTemplate + "{{/.}}",
		formAddNew: "<div class=\"new-form\" id=\"form-new-channel\"><div class=\"form-left-corner\"><button class=\"btn\" id=\"btn-submit-channel\" data-op=\"save\">Add Channel</button></div>" + UI.template.closeModalButton + "<input type=\"text\" id=\"txt-channel\" placeholder=\"Channel name\" /><div id=\"subs-for-channel\"><input class=\"field-edit-sub\" type=\"text\" placeholder=\"Subreddit 1\" /><input class=\"field-edit-sub\" type=\"text\" placeholder=\"Subreddit 2\" /><input class=\"field-edit-sub\" type=\"text\" placeholder=\"Subreddit 3\" /></div>" + tmpltButtonAddAnotherSub + "</div>",
		formEditChannel: "<div class=\"new-form\" id=\"form-new-channel\"><div class=\"form-left-corner\"><button class=\"btn\" id=\"btn-submit-channel\" data-op=\"update\">Update Channel</button></div>" + UI.template.closeModalButton + "<input type=\"text\" id=\"txt-channel\" placeholder=\"Channel name\" /><div id=\"subs-for-channel\"></div>" + tmpltButtonAddAnotherSub + "</div>"
	};

	var list = [],
	    editingNow = '';

	var el = {
		menu: $("#channels")
	};

	var getList = function getList() {
		return list;
	};

	var getURL = function getURL(channel) {
		if (channel.subs.length === 1) {
			// [1] Reddit API-related hack
			return "r/" + channel.subs[0] + "+" + channel.subs[0];
		} else {
			return "r/" + channel.subs.join("+");
		}
	};
	// [1] If there's one subreddit in a "Channel",
	// and this subreddit name's invalid,
	// reddit.com responds with a search-results HTML - not json data
	// and throws a hard-to-catch error...
	// Repeating the one subreddit in the URL avoids this problem :)

	var insert = function insert(channel) {
		list.push(channel);
		Store.setItem('channels', JSON.stringify(list));
		Backup.shouldUpdate();
	};

	var _delete = function _delete(name) {
		for (var j = 0; j < list.length; j++) {
			if (list[j].name === name) {
				list.splice(j, 1);
				break;
			}
		}
		Store.setItem('channels', JSON.stringify(list));
		Backup.shouldUpdate();
	};

	var getByName = function getByName(name) {
		var foundChannel;
		for (var i = 0; i < list.length; i++) {
			if (list[i].name.toLowerCase() === name.toLowerCase()) {
				foundChannel = list[i];
				break;
			}
		}
		return foundChannel;
	};

	var append = function append(channel) {
		el.menu.append(Mustache.to_html(template.single, channel));
		if (Subreddits.isEditing()) {
			addToEditList(channel.name);
		}
	};

	var loadList = function loadList() {
		el.menu.html(Mustache.to_html(template.list, list));
	};

	var detach = function detach(name) {
		var deletedChannel = $('.channel-to-remove[data-title="' + name + '"]');
		deletedChannel.addClass("anim-delete");
		setTimeout(function () {
			deletedChannel.remove();
		}, 200);

		$('.channel[data-title="' + name + '"]').remove();
	};

	var addToEditList = function addToEditList(name) {
		$(".channel-edit-list").append(template.singleEditItem.replace(/\{\{name\}\}/g, name));
	};

	var add = function add(title, subreddits) {
		var channel = {
			name: title,
			subs: subreddits
		};
		insert(channel);
		append(channel);
	};

	var loadSaved = function loadSaved() {
		// Should only execute when first loading the app
		list = Store.getItem('channels');
		if (list) {
			list = JSON.parse(list);
		} else {
			// Load defaults channel(s)
			list = [defaults];
		}
		loadList();
	};

	var loadPosts = function loadPosts(channel) {
		Posts.load(URLs.init + getURL(channel) + '/');
		UI.setSubTitle(channel.name);
		CurrentSelection.setChannel(channel);
	};

	var remove = function remove(name) {
		_delete(name);
		detach(name);
		// If it was the current selection
		if (CurrentSelection.getType() === CurrentSelection.Types.CHANNEL && CurrentSelection.getName() === name) {
			CurrentSelection.setSubreddit('frontPage');
		}
	};

	var edit = function edit(name) {
		var channelToEdit = getByName(name);
		Modal.show(template.formEditChannel, function () {
			// Fill form with current values
			$("#txt-channel").val(channelToEdit.name);

			editingNow = channelToEdit.name;
			var $inputsContainer = $("#subs-for-channel");

			channelToEdit.subs.map(function (sub) {
				var inputTemplate = "<input class='field-edit-sub with-clear' type='text' value='" + sub + "'>";
				$inputsContainer.append(inputTemplate);
			});
		});
	};

	var initListeners = function initListeners() {

		UI.el.body.on('click', "#btn-submit-channel", function (ev) {
			var target = ev.target;
			var txtChannelName = $("#txt-channel"),
			    operation = target.getAttribute("data-op"),
			    channelName = txtChannelName.val();

			if (!channelName) {
				txtChannelName.attr("placeholder", "Enter a Channel name!");
				Anim.shakeForm();
				return;
			}

			var subreddits = [],
			    subs = $("#subs-for-channel input");

			for (var i = 0; i < subs.length; i++) {
				var sub = $(subs[i]).val();
				if (!sub) {
					continue;
				}
				subreddits.push(sub);
			}

			if (subreddits.length === 0) {
				subs[0].placeholder = "Enter at least one subreddit!";
				Anim.shakeForm();
				return;
			}

			switch (operation) {
				case "save":
					// Look for Channel name in the saved ones
					var savedChannel = getByName(channelName);
					if (savedChannel) {
						// If it's already saved
						txtChannelName.val("");
						txtChannelName.attr("placeholder", "'" + channelName + "' already exists.");
						Anim.shakeForm();
						return;
					}
					add(channelName, subreddits);
					break;

				case "update":
					// Remove current and add new
					remove(editingNow);
					add(channelName, subreddits);
					break;
			}

			// confirmation feedback
			$(target).remove();
			$(".form-left-corner").append("<div class='clr-white txt-bld channel-added-msg'>'" + channelName + "' " + operation + "d. Cool!</div>");

			Anim.bounceOut($(".new-form"), Modal.remove);
		});

		UI.el.mainWrap.on('click', '#btn-add-channel', function () {
			Modal.show(template.formAddNew);
		});

		UI.el.mainWrap.on('click', '.btn-remove-channel', function (ev) {
			ev.preventDefault();
			remove(this.dataset.title);
		});

		UI.el.mainWrap.on('click', '.btn-edit-channel', function (ev) {
			ev.preventDefault();
			edit(this.dataset.title);
		});
	};

	// Exports
	return {
		getList: getList,
		getByName: getByName,
		getURL: getURL,
		loadPosts: loadPosts,
		loadSaved: loadSaved,
		initListeners: initListeners,
		template: {
			formAddNew: template.formAddNew,
			singleEditItem: template.singleEditItem
		}
	};
})();

/* global
 $,
 El,
 Posts,
 Markdown,
 UI,
 LinkSummary,
 Footer,
 Header,
 Anim,
 Menu,
 Modal,
 is,
 timeSince,
 URLs
 */

var Comments = (function () {

	var loading = false,
	    replies = {},
	    currentThread;

	var setLoading = function setLoading(areLoading) {
		loading = areLoading;
	};

	var getCurrentThread = function getCurrentThread() {
		return currentThread;
	};

	var updateHash = function updateHash(id) {
		location.hash = '#comments:' + id;
	};

	var getIdFromHash = function getIdFromHash() {
		var match = location.hash.match(/(#comments:)((?:[a-zA-Z0-9]*))/);
		if (match && match[2]) {
			return match[2];
		}
	};

	var navigateFromHash = function navigateFromHash() {
		var id = getIdFromHash();
		show(id);
		if (is.wideScreen) {
			Posts.markSelected(id);
		}
	};

	var showLoadError = function showLoadError(loader) {
		loading = false;
		var error = 'Error loading comments. Refresh to try again.';
		if (is.wideScreen) {
			loader.addClass("loader-error").html(error + '<button class="btn mrgn-cntr-x mrgn-y blck w-33 js-btn-refresh">Refresh</button>');
		} else {
			loader.addClass("loader-error").text(error);
		}
		if (!is.desktop) {
			UI.el.detailWrap.append($("<section/>"));
		}
	};

	var load = function load(data, baseElement, idParent) {
		var now = new Date().getTime(),
		    converter = new Markdown.Converter(),
		    com = $("<div/>").addClass('comments-level');
		for (var i = 0; i < data.length; i++) {
			var c = data[i];

			if (c.kind !== "t1") {
				continue;
			}

			var html = converter.makeHtml(c.data.body),
			    isPoster = Posts.getList()[currentThread].author === c.data.author,
			    permalink = URLs.init + Posts.getList()[currentThread].link + c.data.id,
			    commentLink = {
				href: permalink,
				target: "_blank",
				title: "See this comment on reddit.com",
				tabindex: "-1"
			};

			var comment = $("<div/>").addClass("comment-wrap").attr('tabindex', '0').append($('<div/>').append($("<div/>").addClass("comment-data").append($("<span/>").addClass(isPoster ? "comment-poster" : "comment-author").text(c.data.author)).append($("<a/>").addClass("comment-info no-ndrln").attr(commentLink).text(timeSince(now, c.data.created_utc)))).append($("<div/>").addClass("comment-body").html(html)));

			if (c.data.replies && c.data.replies.data.children[0].kind !== "more") {
				comment.append($("<button/>").addClass("btn blck mrgn-cntr-x comments-button js-reply-button").attr("data-comment-id", c.data.id).text("See replies"));
				replies[c.data.id] = c.data.replies.data.children;
			}

			com.append(comment);
		}

		baseElement.append(com);

		if (idParent) {
			Posts.getLoaded()[idParent] = com;
		}

		UI.el.detailWrap.find('a').attr('target', '_blank');
	};

	var show = function show(id, refresh) {
		if (!Posts.getList()[id]) {
			currentThread = id;

			var loader = UI.addLoader(UI.el.detailWrap);
			loading = true;

			$.ajax({
				dataType: 'jsonp',
				url: URLs.init + "comments/" + id + "/" + URLs.end,
				success: function success(result) {
					loader.remove();
					loading = false;

					Posts.setList(result[0].data);
					LinkSummary.setPostSummary(result[0].data.children[0].data, id);

					Header.el.btnNavBack.removeClass(UI.classes.invisible); // Show

					setRest(id, refresh);

					load(result[1].data.children, $('#comments-container'), id);
				},
				error: function error() {
					showLoadError(loader);
				}
			});
		} else {
			var delay = 0;
			if (Menu.isShowing()) {
				Menu.move(UI.Move.LEFT);
				delay = 301;
			}
			setTimeout(function () {

				if (loading && currentThread && currentThread === id) {
					return;
				}

				loading = true;
				currentThread = id;

				Header.el.btnNavBack.removeClass(UI.classes.invisible); // Show

				var detail = UI.el.detailWrap;
				detail.empty();

				UI.el.detailWrap[0].scrollTop = 0;

				if (Posts.getLoaded()[id] && !refresh) {
					detail.append(Posts.getList()[id].summary);
					$('#comments-container').append(Posts.getLoaded()[id]);
					LinkSummary.updatePostSummary(Posts.getList()[id], id);
					loading = false;
				} else {
					LinkSummary.setPostSummary(Posts.getList()[id], id);
					var url = URLs.init + Posts.getList()[id].link + URLs.end;

					var loader = UI.addLoader(detail);

					$.ajax({
						dataType: 'jsonp',
						url: url,
						success: function success(result) {
							if (currentThread !== id) {
								// In case of trying to load a different thread before this one loaded.
								// TODO: handle this better
								return;
							}
							LinkSummary.updatePostSummary(result[0].data.children[0].data, id);
							loader.remove();
							load(result[1].data.children, $('#comments-container'), id);
							loading = false;
						},
						error: function error() {
							showLoadError(loader);
						}
					});
				}

				setRest(id, refresh);
			}, delay);
		}
	};

	var setRest = function setRest(id, refresh) {
		var postTitle = Posts.getList()[id].title;
		var delay = 0;

		if (!refresh) {
			Footer.setPostTitle(postTitle);
		}

		if (!refresh && UI.getCurrentView() !== UI.View.COMMENTS) {
			Anim.slideFromRight();
			delay = 301;
		}

		Header.el.centerSection.empty().append(Header.el.postTitle);
		Header.el.postTitle.text(postTitle);
		Header.el.subtitle.addClass(UI.classes.invisible);

		if (!is.wideScreen) {
			setTimeout(function () {
				UI.el.detailWrap.focus();
			}, delay);
		}
	};

	var initListeners = function initListeners() {

		UI.el.detailWrap.on('click', '#comments-container a, #selftext a', function (ev) {
			var imageURL = LinkSummary.checkImageLink(this.href);
			if (imageURL) {
				ev.preventDefault();
				Modal.showImageViewer(imageURL);
			}
		});

		UI.el.detailWrap.on('click', '.js-reply-button', function () {
			var button = $(this),
			    commentID = button.attr('data-comment-id'),
			    comments = replies[commentID];
			load(comments, button.parent());
			if (is.iOS) {
				$('.comment-active').removeClass('comment-active');
				button.parent().addClass('comment-active');
			}
			button.remove();
		});
	};

	// Exports
	return {
		initListeners: initListeners,
		navigateFromHash: navigateFromHash,
		getCurrentThread: getCurrentThread,
		show: show,
		updateHash: updateHash,
		setLoading: setLoading,
		getIdFromHash: getIdFromHash
	};
})();

/* global
 Store
 */

var CurrentSelection = (function () {

	var name = '',
	    type = '';

	var Types = {
		SUB: 1,
		CHANNEL: 2
	};

	var storeKey = 'currentSelection';

	var getName = function getName() {
		return name;
	};

	var getType = function getType() {
		return type;
	};

	var set = function set(newName, newType) {
		name = newName;
		type = newType;
		Store.setItem(storeKey, JSON.stringify({ name: name, type: type }));
	};

	var loadSaved = function loadSaved() {
		var loadedSelection = Store.getItem(storeKey);

		if (loadedSelection) {
			loadedSelection = JSON.parse(loadedSelection);
		}

		name = loadedSelection ? loadedSelection.name : 'frontPage';
		type = loadedSelection ? loadedSelection.type : Types.SUB;
	};

	var setSubreddit = function setSubreddit(sub) {
		set(sub, Types.SUB);
	};

	var setChannel = function setChannel(channel) {
		set(channel.name, Types.CHANNEL);
	};

	var execute = function execute(caseSub, caseChannel) {
		switch (type) {
			case Types.SUB:
				caseSub();
				break;
			case Types.CHANNEL:
				caseChannel();
				break;
		}
	};

	// Exports
	return {
		getName: getName,
		getType: getType,
		Types: Types,
		loadSaved: loadSaved,
		setSubreddit: setSubreddit,
		setChannel: setChannel,
		execute: execute
	};
})();

/* global
 $,
 UI
 */

var Footer = (function () {

	var refreshButton = '';

	var noLink = "No Post Selected";

	var el = {
		detail: $('#detail-footer'),
		postTitle: $('#footer-post'),
		subTitle: $('#footer-sub'),

		getRefreshButton: function getRefreshButton() {
			if (!refreshButton) {
				refreshButton = document.querySelector('#main-footer .footer-refresh');
			}
			return refreshButton;
		}
	};

	var setPostTitle = function setPostTitle(title) {
		el.postTitle.text(title ? title : noLink);
		var buttons = el.detail.find('.btn-footer');
		if (title) {
			buttons.removeClass(UI.classes.hide);
		} else {
			buttons.addClass(UI.classes.hide);
		}
	};

	// Exports
	return {
		el: el,
		setPostTitle: setPostTitle
	};
})();

/* global
 $,
 is,
 Menu,
 Posts,
 UI
 */

var Header = (function () {

	var el = {
		subtitle: $('#main-title'),
		subtitleText: $('#sub-title'),
		centerSection: $('#title-head'),
		postTitle: $('#title'),
		icon: $('#header-icon'),
		btnNavBack: $('#nav-back')
	};

	var initListeners = function initListeners() {
		el.subtitleText.on('click', function () {
			if (is.mobile && Posts.areLoading()) {
				return;
			}
			Menu.move(Menu.isShowing() ? UI.Move.LEFT : UI.Move.RIGHT);
		});
	};

	// Exports
	return {
		el: el,
		initListeners: initListeners
	};
})();

/* global
 Posts,
 Mustache,
 El,
 Footer,
 timeSince,
 Markdown,
 UI,
 Modal
 */

var LinkSummary = (function () {

	var template = "\n\t\t<section id='link-summary'>\n\t\t\t<a href='{{url}}'\n\t\t\t   target='_blank'\n\t\t\t   class='no-ndrln'>\n\t\t\t\t<span id='summary-title'\n\t\t\t\t\t  class='pad-x txt-bld blck'>{{title}}</span>\n\t\t\t\t<span id='summary-domain'\n\t\t\t\t\t  class='pad-x txt-bld'>{{domain}}</span>\n\t\t\t\t{{#over_18}}\n\t\t\t\t<span class='link-label txt-bld summary-label nsfw'>NSFW</span>\n\t\t\t\t{{/over_18}}\n\t\t\t\t{{#stickied}}\n\t\t\t\t<span class='link-label txt-bld summary-label stickied'>Stickied</span>\n\t\t\t\t{{/stickied}}\n\t\t\t</a>\n\t\t\t<div id='summary-footer'>\n\t\t\t\t<span id='summary-author'\n\t\t\t\t\t  class='pad-x txt-bld'>by {{author}}</span>\n\t\t\t\t<a class='btn mrgn-x no-ndrln'\n\t\t\t\t   id='share-tw'\n\t\t\t\t   target='_blank'\n\t\t\t\t   href='https://twitter.com/intent/tweet?text=\"{{encodedTitle}}\" —&url={{url}}&via=ReedditApp&related=ReedditApp'>Tweet</a>\n\t\t\t</div>\n\t\t\t<div class='ls-extra flx flx-spc-btwn-x txt-bld'>\n\t\t\t\t<span class='w-33'\n\t\t\t\t\t  id='summary-sub'>{{subreddit}}</span>\n\t\t\t\t<span class='w-33 txt-cntr'\n\t\t\t\t\t  id='summary-time'></span>\n\t\t\t\t<a class='w-33 no-ndrln txt-r clr-current'\n\t\t\t\t   id='summary-comment-num'\n\t\t\t\t   title='See comments on reddit.com'\n\t\t\t\t   href='http://reddit.com{{link}}'\n\t\t\t\t   target='_blank'>{{num_comments}} comments</a>\n\t\t\t</div>\n\t\t</section>";

	var setPostSummary = function setPostSummary(data, postID) {
		if (!data.link) {
			data.link = data.permalink;
		}
		// Main content
		var summaryHTML = Mustache.to_html(template, data);
		// Check for type of post
		if (data.selftext) {
			// If it's a self-post
			var selfText;
			if (Posts.getList()[postID].selftextParsed) {
				selfText = Posts.getList()[postID].selftext;
			} else {
				var summaryConverter1 = new Markdown.Converter();
				selfText = summaryConverter1.makeHtml(data.selftext);
				Posts.getList()[postID].selftext = selfText;
				Posts.getList()[postID].selftextParsed = true;
			}
			summaryHTML += "<section id='selftext' class='pad-x mrgn-x mrgn-y'>" + selfText + "</section>";
		} else {
			// if it's an image
			var linkURL = Posts.getList()[postID].url;
			var imageLink = checkImageLink(linkURL);
			if (imageLink) {
				// If it's an image link
				summaryHTML += '<a href="#preview" class="preview-container blck js-img-preview" data-img="' + imageLink + '">' + '<img class="image-preview" src="' + imageLink + '" />' + '</a>';
			} else {
				// if it's a YouTube video
				var youTubeID = getYouTubeVideoIDfromURL(linkURL);
				if (youTubeID) {
					summaryHTML += "<a class=\"preview-container blck\" \n\t\t\t\t\t\t\t\thref=\"" + linkURL + "\" \n\t\t\t\t\t\t\t\ttarget=\"_blank\">\n\t\t\t\t\t\t <img class=\"video-preview\" \n\t\t\t\t\t\t      src=\"//img.youtube.com/vi/" + youTubeID + "/hqdefault.jpg\"/>\n\t\t\t\t\t\t </a>";
				} else {
					// if it's a Gfycat link
					var gfycatID = getGfycatIDfromURL(linkURL);
					if (gfycatID) {
						summaryHTML += "<div style='position:relative; padding-bottom:56.69%'>" + "<iframe src='https://gfycat.com/ifr/" + gfycatID + "' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe>" + "</div>";
					}
				}
			}
		}
		summaryHTML += "<section id='comments-container'></section>";
		UI.el.detailWrap.append(summaryHTML);
		updatePostTime(data.created_utc);
		Posts.getList()[postID].summary = summaryHTML;
		Footer.el.postTitle.text(data.title);
	};

	var updatePostSummary = function updatePostSummary(data, postID) {
		$("#summary-comment-num").text(data.num_comments + (data.num_comments === 1 ? ' comment' : ' comments'));
		// Time ago
		updatePostTime(data.created_utc);
		Posts.getList()[postID].num_comments = data.num_comments;
		Posts.getList()[postID].created_utc = data.created_utc;
	};

	var updatePostTime = function updatePostTime(time) {
		$("#summary-time").text(timeSince(new Date().getTime(), time));
	};

	var checkImageLink = function checkImageLink(url) {
		var matching = url.match(/\.(svg|jpe?g|png|gifv?)(?:[?#].*)?$|(?:imgur\.com|livememe\.com|reddituploads\.com)\/([^?#\/.]*)(?:[?#].*)?(?:\/)?$/);
		if (!matching) {
			return '';
		}
		if (matching[1]) {
			// normal image link
			if (url.indexOf('.gifv') > 0) {
				url = url.replace('.gifv', '.gif');
			}
			if (url.indexOf('imgur.com') >= 0) {
				url = url.replace(/^htt(p|ps):/, '');
			}
			return url;
		} else if (matching[2]) {
			if (matching[0].slice(0, 5) === "imgur") {
				// imgur
				return "//imgur.com/" + matching[2] + ".jpg";
			} else if (matching[0].indexOf("livememe.") >= 0) {
				// livememe
				return "http://i.lvme.me/" + matching[2] + ".jpg";
			} else if (matching[0].indexOf("reddituploads.") >= 0) {
				// reddit media
				return matching.input;
			} else {
				return null;
			}
		} else {
			return null;
		}
	};

	var getYouTubeVideoIDfromURL = function getYouTubeVideoIDfromURL(url) {
		var matching = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
		if (!matching) {
			return '';
		} else {
			if (matching[2].length === 11) {
				return matching[2];
			} else {
				return null;
			}
		}
	};

	var getGfycatIDfromURL = function getGfycatIDfromURL(url) {
		var matching = url.match(/gfycat.com\/(gifs\/detail\/)?(\w+)/i);
		if (!matching) {
			return '';
		} else {
			if (matching && matching.length > 2) {
				return matching[2];
			} else {
				return null;
			}
		}
	};

	var initListeners = function initListeners() {
		UI.el.detailWrap.on('click', '.js-img-preview', function (ev) {
			ev.preventDefault();
			Modal.showImageViewer(this.dataset.img);
		});
	};

	// Exports
	return {
		setPostSummary: setPostSummary,
		updatePostSummary: updatePostSummary,
		checkImageLink: checkImageLink,
		initListeners: initListeners
	};
})();

/* global
 El,
 Channels,
 Subreddits,
 Modal,
 UI,
 is,
 CurrentSelection
 */

var Menu = (function () {

	var el = {
		mainMenu: $('#main-menu'),
		buttonNewSubreddit: $('#btn-new-sub'),
		buttonNewChannel: $('#btn-new-channel'),
		buttonAddSubreddits: $('#btn-add-subs'),
		buttonEditSubreddits: $('#btn-edit-subs'),
		buttonAbout: $('#about')
	};

	var showing = false;

	var isShowing = function isShowing() {
		return showing;
	};

	var template = {
		about: '<div class=\'new-form about-reeddit\'>' + UI.template.closeModalButton + '<ul><li><a href=\'/about/\' target=\'_blank\'>Reeddit Homepage</a></li><li><a href=\'https://github.com/berbaquero/reeddit\' target=\'_blank\'>GitHub Project</a></li></ul><p><a href=\'https://twitter.com/reedditapp\'>@ReedditApp</a></p><p>Built by <a href=\'http://berbaquero.com\' target=\'_blank\'>Bernardo Baquero Stand</a></p></div>'
	};

	var subSelectedClass = 'sub--selected',
	    channelSelectedClass = 'channel--selected';

	var move = function move(direction) {
		if (is.iPhone && is.iOS7) {
			UI.el.mainView.removeClass(UI.classes.swipe);
			UI.el.detailView.removeClass(UI.classes.swipe);
		}
		if (direction === UI.Move.LEFT) {
			UI.el.mainView.removeClass(UI.classes.showMenu);
			setTimeout(function () {
				showing = false;
			}, 1);
		}
		if (direction === UI.Move.RIGHT) {
			UI.el.mainView.addClass(UI.classes.showMenu);
			setTimeout(function () {
				showing = true;
			}, 1);
		}
	};

	var markSelected = function markSelected(params /* {type, el, name, update} */) {
		var type = params.type;
		var el = params.el;
		var name = params.name;
		var update = params.update;

		if (update) {
			cleanSelected();
		}

		var isChannel = type && type === 'channel';

		if (el) {
			el.classList.add(isChannel ? channelSelectedClass : subSelectedClass);
			return;
		}

		if (name) {
			var selector = isChannel ? '.channel[data-title="' + name + '"]' : '.sub[data-name="' + name + '"]';

			var activeSub = document.querySelector(selector);
			activeSub.classList.add(isChannel ? channelSelectedClass : subSelectedClass);
		}
	};

	var cleanSelected = function cleanSelected() {
		$(".sub.sub--selected").removeClass(subSelectedClass);
		$(".channel.channel--selected").removeClass(channelSelectedClass);
	};

	var initListeners = function initListeners() {

		el.mainMenu.on('click', '.channel', function (ev) {
			ev.preventDefault();
			var target = this;
			var channelName = target.getAttribute('data-title');
			Menu.move(UI.Move.LEFT);
			if (channelName === CurrentSelection.getName() && !Subreddits.isEditing()) {
				return;
			}
			Menu.markSelected({ type: 'channel', el: target, update: true });
			if (UI.getCurrentView() === UI.View.COMMENTS) {
				UI.backToMainView();
			}
			Channels.loadPosts(Channels.getByName(channelName));
		});

		el.mainMenu.on('click', '.sub', function (ev) {
			ev.preventDefault();
			var target = ev.target;
			Menu.move(UI.Move.LEFT);
			Subreddits.loadPosts(target.dataset.name);
			markSelected({ el: target, update: true });
			if (UI.getCurrentView() === UI.View.COMMENTS) {
				UI.backToMainView();
			}
		});

		el.buttonNewSubreddit.on('click', function (ev) {
			ev.preventDefault();
			Modal.show(Subreddits.template.formInsert);
		});

		el.buttonNewChannel.on('click', function (ev) {
			ev.preventDefault();
			Modal.show(Channels.template.formAddNew);
		});

		el.buttonAddSubreddits.on('click', function (ev) {
			ev.preventDefault();
			Subreddits.loadForAdding();
		});

		el.buttonEditSubreddits.on('click', function (ev) {
			ev.preventDefault();
			Subreddits.loadForEditing();
		});

		el.buttonAbout.on('click', function (ev) {
			ev.preventDefault();
			Modal.show(template.about);
		});
	};

	// Exports
	return {
		isShowing: isShowing,
		initListeners: initListeners,
		move: move,
		markSelected: markSelected,
		cleanSelected: cleanSelected,
		el: el
	};
})();

/* global
 Menu,
 Anim,
 is,
 UI
 */

var Modal = (function () {

	var showing = false;

	var setShowing = function setShowing(shown) {
		showing = shown;
	};

	var isShowing = function isShowing() {
		return showing;
	};

	var show = function show(template, callback, config) {
		var delay = 1;
		if (!is.largeScreen && Menu.isShowing()) {
			Menu.move(UI.Move.LEFT);
			delay = 301;
		}
		setTimeout(function () {
			if (isShowing()) {
				return;
			}
			var modal = $('<div/>').attr({ id: 'modal', tabindex: '0', 'class': 'modal' }),
			    bounce = true;
			if (config) {
				if (config.modalClass) {
					modal.addClass(config.modalClass);
				}
				if (config.noBounce) {
					bounce = false;
				}
			}
			modal.append(template);
			UI.el.body.append(modal);
			modal.focus();
			switchKeyListener(true);
			setShowing(true);
			setTimeout(function () {
				modal.css('opacity', 1);
				if (bounce) {
					Anim.bounceInDown($(".new-form"));
				}
			}, 1);
			if (callback) {
				callback();
			}
		}, delay);
	};

	var remove = function remove() {
		var modal = $('#modal');
		modal.css('opacity', '');
		setShowing(false);
		setTimeout(function () {
			modal.remove();
			switchKeyListener(false);
		}, 301);
	};

	var showImageViewer = function showImageViewer(imageURL) {
		var imageViewer = '<img class="image-viewer centered-transform" src="' + imageURL + '">',
		    config = {
			modalClass: 'modal--closable',
			noBounce: true
		};
		Modal.show(imageViewer, false, config);
	};

	var handleKeyPress = function handleKeyPress(ev) {
		if (ev.which === 27) {
			remove();
		}
	};

	var switchKeyListener = function switchKeyListener(flag) {
		if (flag) {
			UI.el.body.on('keydown', handleKeyPress);
		} else {
			UI.el.body.off('keydown', handleKeyPress);
		}
	};

	var initListeners = function initListeners() {
		UI.el.body.on('click', '.modal--closable', Modal.remove);
	};

	// Exports
	return {
		show: show,
		remove: remove,
		showImageViewer: showImageViewer,
		initListeners: initListeners,
		isShowing: isShowing
	};
})();

/* global
 $,
 is,
 El,
 UI,
 Anim,
 Mustache,
 Comments,
 Channels,
 Subreddits,
 Menu,
 CurrentSelection,
 Sorting,
 URLs
 */

var Posts = (function () {

	var template = '\n\t\t{{#children}}\n\t\t\t<article class=\'link-wrap flx w-100\'>\n\t\t\t\t<div class=\'link flx no-ndrln pad-y pad-x js-link\' data-id=\'{{data.id}}\'>\n\t\t\t\t\t<div class=\'link-thumb\'>\n\t\t\t\t\t\t<div style=\'background-image: url({{data.thumbnail}})\'></div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\'link-info\'>\n\t\t\t\t\t\t<a href=\'{{data.url}}\'\n\t\t\t\t\t\t   data-id=\'{{data.id}}\'\n\t\t\t\t\t\t   target=\'_blank\'\n\t\t\t\t\t\t   class=\'link-title no-ndrln blck js-post-title\'>\n\t\t\t\t\t\t{{data.title}}\n\t\t\t\t\t\t</a>\n\t\t\t\t\t\t<div class=\'link-domain\'>{{data.domain}}</div>\n\t\t\t\t\t\t<span class=\'link-sub\'>{{data.subreddit}}</span>\n\t\t\t\t\t\t{{#data.over_18}}\n\t\t\t\t\t\t<span class=\'link-label txt-bld nsfw\'>NSFW</span>\n\t\t\t\t\t\t{{/data.over_18}}\n\t\t\t\t\t\t{{#data.stickied}}\n\t\t\t\t\t\t<span class=\'link-label txt-bld stickied\'>Stickied</span>\n\t\t\t\t\t\t{{/data.stickied}}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<a href=\'#comments:{{data.id}}\' class=\'to-comments w-15 flx flx-cntr-y btn-basic\'>\n\t\t\t\t\t<div class=\'comments-icon\'></div>\n\t\t\t\t</a>\n\t\t\t</article>\n\t\t{{/children}}\n\t\t<button id=\'btn-load-more-posts\'\n\t\t\t\tclass=\'btn blck mrgn-cntr-x\'>More</button>\n\t\t<div id=\'main-overflow\'></div>';

	var loading = false,
	    list = {},
	    loaded = {},
	    idLast = '';

	var el = {
		moreButton: function moreButton() {
			return $('#btn-load-more-posts');
		}
	};

	var getList = function getList() {
		return list;
	};

	var getLoaded = function getLoaded() {
		return loaded;
	};

	var setLoading = function setLoading(newLoading) {
		loading = newLoading;
	};

	var areLoading = function areLoading() {
		return loading;
	};

	var open = function open(url, id) {
		var link = list[id];
		if (link.self || is.wideScreen) {
			Comments.updateHash(id);
		} else {
			triggerClick(url);
		}
	};

	var load = function load(baseUrl, paging) {
		if (loading) {
			return;
		}

		loading = true;

		Comments.setLoading(false);
		Subreddits.setEditing(false);

		var main = UI.el.mainWrap;

		if (paging) {
			el.moreButton().remove(); // remove current button
			main.append(UI.template.loader);
		} else {
			UI.el.mainWrap[0].scrollTop = 0; // to container top
			setTimeout(function () {
				main.prepend(UI.template.loader);
			}, Menu.isShowing() ? 301 : 1);
			paging = ''; // empty string, to avoid pagination
		}

		$.ajax({
			dataType: 'jsonp',
			url: baseUrl + Sorting.get() + URLs.limitEnd + paging,
			success: function success(result) {
				show(result, paging);
			},
			error: function error() {
				loading = false;
				$('.loader').addClass("loader-error").text('Error loading links. Refresh to try again.');
			}
		});
	};

	var loadFromManualInput = function loadFromManualInput(loadedLinks) {
		show(loadedLinks);
		UI.el.mainWrap[0].scrollTop = 0;
		Subreddits.setEditing(false);
	};

	var render = function render(links, paging) {
		// links: API raw data
		var linksCount = links.children.length,
		    main = UI.el.mainWrap;

		if (paging) {
			$(".loader").remove();
		} else {
			if (is.desktop) {
				main.empty();
			} else {
				main.empty().removeClass("anim-reveal").addClass(UI.classes.invisible);
			}
		}

		if (linksCount === 0) {
			var message = $('.loader');
			if (message) {
				message.text('No Links available.').addClass('loader-error');
				main.append('<div id="#main-overflow"></div>');
			} else {
				main.prepend('<div class="loader loader-error">No Links available.</div><div id="main-overflow"></div>');
			}
		} else {
			// Add new links to the list
			var compiledHTML = Mustache.to_html(template, links);
			// http -> relative in post thumbnails
			// searches and replaces 'url(http' to make sure it's only the thumbnail urls
			var httpsHTML = compiledHTML.replace(/url\(http\:/g, 'url(');
			main.append(httpsHTML);

			// Remove thumbnail space for those links with invalid backgrounds.
			var thumbnails = $('.link-thumb > div');

			// Remove the thumbnail space if post has no thumbnail
			// TODO: parse API json data to make this DOM manipulation not needed
			for (var i = 0; i < thumbnails.length; i++) {
				var thumbnail = $(thumbnails[i]);
				var backgroundImageStyle = thumbnail.attr('style').replace("background-image: ", "");

				if (backgroundImageStyle === 'url()' || backgroundImageStyle === 'url(default)' || backgroundImageStyle === 'url(nsfw)' || backgroundImageStyle === 'url(image)' || backgroundImageStyle === 'url(spoiler)' || backgroundImageStyle === 'url(self)') {
					thumbnail.parent().remove();
				}
			}
		}

		if (linksCount < 30) {
			// Remove 'More links' button if there are less than 30 links
			el.moreButton().remove();
		}

		if (!is.desktop) {
			UI.scrollFixLinks();
		}

		if (!paging) {
			Anim.reveal(main);
		}

		if (!is.largeScreen) {
			UI.el.mainWrap.focus();
		}
	};

	var show = function show(result, paging) {
		var posts = result.data;
		loading = false;
		idLast = posts.after;

		render(posts, paging);
		setList(posts);

		if (is.wideScreen) {
			var id = Comments.getIdFromHash();
			if (id) {
				markSelected(id);
			}
		}
	};

	var setList = function setList(posts) {
		for (var i = 0; i < posts.children.length; i++) {
			var post = posts.children[i];
			if (list[post.data.id]) {
				// if already cached
				list[post.data.id].num_comments = post.data.num_comments;
				list[post.data.id].created_utc = post.data.created_utc;
			} else {
				// if not yet cached
				list[post.data.id] = {
					title: post.data.title,
					encodedTitle: encodeURI(post.data.title),
					selftext: post.data.selftext,
					created_utc: post.data.created_utc,
					domain: post.data.domain,
					subreddit: post.data.subreddit,
					num_comments: post.data.num_comments,
					url: post.data.url,
					self: post.data.is_self,
					link: post.data.permalink,
					author: post.data.author,
					over_18: post.data.over_18,
					stickied: post.data.stickied
				};
			}
		}
	};

	var refreshStream = function refreshStream() {
		if (Subreddits.isEditing()) {
			return;
		}
		CurrentSelection.execute(function () {
			// if it's subreddit
			if (CurrentSelection.getName().toLowerCase() === 'frontpage') {
				load(URLs.init + "r/" + Subreddits.getAllSubsString() + "/");
			} else {
				load(URLs.init + "r/" + CurrentSelection.getName() + "/");
			}
		}, function () {
			// if it's channel
			Channels.loadPosts(Channels.getByName(CurrentSelection.getName()));
		});
	};

	var markSelected = function markSelected(id) {
		$(".link.link-selected").removeClass("link-selected");
		$('.link[data-id="' + id + '"]').addClass('link-selected');
	};

	var clearSelected = function clearSelected() {
		$('.link.link-selected').removeClass('link-selected');
	};

	var triggerClick = function triggerClick(url) {
		var a = document.createElement('a');
		a.setAttribute("href", url);
		a.setAttribute("target", "_blank");

		var clickEvent = new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		});

		a.dispatchEvent(clickEvent);
	};

	var initListeners = function initListeners() {

		UI.el.mainWrap.on('click', '.js-link', function (ev) {
			ev.preventDefault();

			if (!is.wideScreen) {
				return;
			}

			Comments.updateHash(this.dataset.id);
		});

		UI.el.mainWrap.on('click', '.js-post-title', function (ev) {
			ev.preventDefault();

			var id = ev.target.dataset.id,
			    url = ev.target.href;

			open(url, id);
		});

		UI.el.mainWrap.on('click', '#btn-load-more-posts', function () {
			CurrentSelection.execute(function () {
				var url;
				if (CurrentSelection.getName().toLowerCase() === 'frontpage') {
					url = URLs.init + 'r/' + Subreddits.getAllSubsString() + '/';
				} else {
					url = URLs.init + 'r/' + CurrentSelection.getName() + '/';
				}
				load(url, '&after=' + idLast);
			}, function () {
				var channel = Channels.getByName(CurrentSelection.getName());
				load(URLs.init + Channels.getURL(channel) + '/', '&after=' + idLast);
			});
		});
	};

	// Exports
	return {
		initListeners: initListeners,
		load: load,
		clearSelected: clearSelected,
		refreshStream: refreshStream,
		markSelected: markSelected,
		loadFromManualInput: loadFromManualInput,
		setLoading: setLoading,
		areLoading: areLoading,
		getList: getList,
		setList: setList,
		getLoaded: getLoaded
	};
})();

/* global
 Sorting,
 Posts,
 */

var SortSwitch = (function () {

	// Initial State
	var isHot = true;

	var classes = {
		'new': 'sort-switch--new'
	};

	var wrap = '';

	var el = {
		getWrap: function getWrap() {
			if (!wrap) {
				wrap = document.getElementsByClassName('sorter-wrap')[0];
			}
			return wrap;
		},
		mainSwitch: $('.js-sort-switch-main')
	};

	var initListeners = function initListeners() {
		el.mainSwitch.on('click', function (ev) {
			ev.preventDefault();
			var target = this;
			if (Posts.areLoading()) {
				return;
			}
			isHot = !isHot;
			Sorting.change(isHot ? 'hot' : 'new');
			if (isHot) {
				target.classList.remove(classes['new']);
			} else {
				target.classList.add(classes['new']);
			}
		});
	};

	// Exports
	return {
		el: el,
		initListeners: initListeners
	};
})();

/* global
 Menu,
 Posts,
 UI
 */

var Sorting = (function () {

	var current = 'hot';

	var get = function get() {
		return current !== 'hot' ? current + '/' : '';
	};

	var change = function change(sorting) {
		current = sorting;
		var delay = 1;
		if (Menu.isShowing()) {
			Menu.move(UI.Move.LEFT);
			delay = 301;
		}
		setTimeout(function () {
			Posts.refreshStream();
		}, delay);
	};

	// Exports
	return {
		get: get,
		change: change
	};
})();

/* global
 $,
 $$,
 Store,
 Mustache,
 CurrentSelection,
 UI,
 El,
 Menu,
 Anim,
 Footer,
 SortSwitch,
 is,
 Modal,
 Posts,
 Channels,
 Backup,
 Sorting,
 URLs
 */

var Subreddits = (function () {

	var defaults = ["frontPage", "all", "pics", "IAmA", "AskReddit", "worldNews", "todayilearned", "tech", "science", "reactiongifs", "books", "explainLikeImFive", "videos", "AdviceAnimals", "funny", "aww", "earthporn"],
	    list = [],
	    idLast = '',
	    editing = false,
	    loadedSubs;

	var subredditClasses = 'sub pad-x pad-y blck no-ndrln txt-cap txt-ellps';

	var template = {
		list: "{{#.}}<a href='#{{.}}' data-name='{{.}}' class='" + subredditClasses + "'>{{.}}</a>{{/.}}",
		toEditList: "<div class='edit-subs-title pad-x pad-y txt-bld txt-cntr'>Subreddits</div><ul class='no-mrgn no-pad'>{{#.}}<div class='item-to-edit flx sub-to-remove' data-name='{{.}}'><p class='sub-name w-85 txt-cap txt-bld'>{{.}}</p><a href='#remove' class='no-ndrln clr-current flx flx-cntr-x flx-cntr-y w-15 btn-remove-sub icon-trashcan' data-name='{{.}}'></a></div>{{/.}}</ul>",
		toAddList: "{{#children}}<div class='sub-to-add flx w-100'><div class='w-85'><p class='sub-to-add__title js-sub-title txt-bld'>{{data.display_name}}</p><p class='sub-to-add__description'>{{data.public_description}}</p></div><a href='#add' class='btn-add-sub no-ndrln flx flx-cntr-x flx-cntr-y w-15 icon-plus-circle'></a></div>{{/children}}",
		loadMoreSubsButton: "<button class='btn blck w-50 mrgn-y mrgn-cntr-x' id='btn-more-subs'>More</button>",
		formInsert: "<div class=\"new-form\" id=\"form-new-sub\"><div class=\"form-left-corner\"><button class=\"btn\" id=\"btn-add-new-sub\">Add Subreddit</button></div>" + UI.template.closeModalButton + "<form><input type=\"text\" id=\"txt-new-sub\" placeholder=\"New subreddit name\" /></form></div>",
		topButtonsForAdding: "<div class='flx flx-cntr-x pad-x pad-y'><button id='btn-sub-man' class='btn group-btn'>Insert Manually</button><button id='btn-add-channel' class='btn group-btn'>Create Channel</button></div>"
	};

	var el = {
		list: $("#subs")
	};

	var getList = function getList() {
		return list;
	};

	var isEditing = function isEditing() {
		return editing;
	};

	var insert = function insert(sub) {
		list.push(sub);
		Store.setItem("subreeddits", JSON.stringify(list));
		Backup.shouldUpdate();
	};

	var _delete = function _delete(sub) {
		var idx = list.indexOf(sub);
		list.splice(idx, 1);
		Store.setItem("subreeddits", JSON.stringify(list));
		Backup.shouldUpdate();
	};

	var append = function append(subs) {
		if (subs instanceof Array) {
			el.list.append(Mustache.to_html(template.list, subs));
		} else {
			el.list.append($("<a/>").attr({ 'data-name': subs, 'href': '#' }).addClass(subredditClasses).text(subs));
		}
	};

	var detach = function detach(sub) {
		var deletedSub = $(".sub-to-remove[data-name='" + sub + "']");
		deletedSub.addClass("anim-delete");
		setTimeout(function () {
			deletedSub.remove();
		}, 200);

		el.list.find(".sub[data-name=" + sub + "]").remove();
	};

	var setList = function setList(subs) {
		list = subs;
		Store.setItem("subreeddits", JSON.stringify(list));
		Backup.shouldUpdate();
	};

	var listHasSub = function listHasSub(newSub) {
		if (list) {
			newSub = newSub.toLowerCase();
			for (var i = list.length; --i;) {
				var sub = list[i];
				if (sub.toLowerCase() === newSub) {
					return true;
				}
			}
			return false;
		}
		return false;
	};

	var getAllSubsString = function getAllSubsString() {
		var allSubs = '',
		    frontPage = 'frontpage',
		    all = 'all';
		for (var i = 0; i < list.length; i++) {
			var sub = list[i].toLowerCase();
			if (sub === frontPage || sub === all) {
				continue;
			}
			allSubs += sub + '+';
		}
		return allSubs.substring(0, allSubs.length - 1);
	};

	var loadSaved = function loadSaved() {
		// Only should execute when first loading the app
		var subs = Store.getItem("subreeddits");
		if (subs) {
			subs = JSON.parse(subs);
		}
		list = subs;
		if (!list) {
			// If it hasn't been loaded to the 'local Store', save defaults subreddits
			setList(defaults);
		}
		append(list);
	};

	var loadPosts = function loadPosts(sub) {
		if (sub !== CurrentSelection.getName() || editing) {
			var url;
			if (sub.toLowerCase() === 'frontpage') {
				url = URLs.init + "r/" + getAllSubsString() + "/";
			} else {
				url = URLs.init + "r/" + sub + "/";
			}
			Posts.load(url);
			CurrentSelection.setSubreddit(sub);
		}
		UI.setSubTitle(sub);
	};

	var remove = function remove(sub) {
		_delete(sub);
		detach(sub);
		if (CurrentSelection.getType() === CurrentSelection.Types.SUB && CurrentSelection.getName() === sub) {
			// If it was the current selection
			CurrentSelection.setSubreddit('frontPage');
		}
	};

	var add = function add(newSub) {
		if (listHasSub(newSub)) {
			return;
		}
		insert(newSub);
		append(newSub);
	};

	var addFromNewForm = function addFromNewForm() {
		var txtSub = $$.id("txt-new-sub"),
		    subName = txtSub.value;
		if (!subName) {
			txtSub.setAttribute("placeholder", "Enter a subreddit title!");
			Anim.shakeForm();
			return;
		}
		if (listHasSub(subName)) {
			txtSub.value = "";
			txtSub.setAttribute("placeholder", subName + " already added!");
			Anim.shakeForm();
			return;
		}

		subName = subName.trim();

		Anim.bounceOut($(".new-form"), Modal.remove);

		$.ajax({
			url: URLs.init + "r/" + subName + "/" + Sorting.get() + URLs.limitEnd,
			dataType: 'jsonp',
			success: function success(data) {
				Posts.loadFromManualInput(data);
				UI.setSubTitle(subName);
				CurrentSelection.setSubreddit(subName);
				add(subName);
				Menu.markSelected({
					name: subName,
					update: true
				});
			},
			error: function error() {
				alert('Oh, the subreddit you entered is not valid...');
			}
		});
	};

	var setEditing = function setEditing( /* boolean */newEditing) {
		if (newEditing === editing) {
			return;
		}
		editing = newEditing;
		if (is.wideScreen) {
			UI.switchDisplay(Footer.el.getRefreshButton(), newEditing);
			UI.switchDisplay(SortSwitch.el.getWrap(), newEditing);
		}
	};

	var loadForAdding = function loadForAdding() {
		if (!is.largeScreen) {
			Menu.move(UI.Move.LEFT);
		}
		if (UI.getCurrentView() === UI.View.COMMENTS) {
			UI.backToMainView();
		}

		setTimeout(function () {
			UI.el.mainWrap[0].scrollTop = 0; // Go to the container top
			var main = UI.el.mainWrap;
			if (loadedSubs) {
				main.empty().append(template.topButtonsForAdding).append(loadedSubs).append(template.loadMoreSubsButton);
			} else {
				main.prepend(UI.template.loader).prepend(template.topButtonsForAdding);
				$.ajax({
					url: URLs.init + "reddits/.json?limit=50&jsonp=?",
					dataType: 'jsonp',
					success: function success(list) {
						idLast = list.data.after;
						loadedSubs = Mustache.to_html(template.toAddList, list.data);
						main.empty().append(template.topButtonsForAdding).append(loadedSubs).append(template.loadMoreSubsButton);
					},
					error: function error() {
						$('.loader').addClass("loader-error").text('Error loading subreddits.');
					}
				});
			}
			Posts.setLoading(false);
		}, is.largeScreen ? 1 : 301);
		Menu.cleanSelected();
		UI.setSubTitle("Add Subs");
		setEditing(true);
	};

	var loadForEditing = function loadForEditing() {
		if (!is.largeScreen) {
			Menu.move(UI.Move.LEFT);
		}
		if (UI.getCurrentView() === UI.View.COMMENTS) {
			UI.backToMainView();
		}

		setTimeout(function () {
			UI.el.mainWrap[0].scrollTop = 0; // Up to container top
			var htmlSubs = Mustache.to_html(template.toEditList, list);
			var htmlChannels = '',
			    channelsList = Channels.getList();

			if (channelsList && channelsList.length > 0) {
				htmlChannels = Mustache.to_html("<div class='edit-subs-title pad-x pad-y txt-bld txt-cntr'>Channels</div><ul class='no-mrgn no-pad channel-edit-list'>{{#.}} " + Channels.template.singleEditItem + "{{/.}}</ul>", channelsList);
			}

			var html = '<div class="h-100">' + htmlChannels + htmlSubs + "</div>";
			setTimeout(function () {
				// Intentional delay / fix for iOS
				UI.el.mainWrap.html(html);
			}, 10);

			Menu.cleanSelected();
			Posts.setLoading(false);
		}, is.largeScreen ? 1 : 301);

		UI.setSubTitle('Edit Subs');
		setEditing(true);
	};

	var initListeners = function initListeners() {

		// New Subreddit Form
		UI.el.body.on('submit', '#form-new-sub form', function (e) {
			e.preventDefault();
			addFromNewForm();
		});

		UI.el.body.on('click', "#btn-add-new-sub", addFromNewForm);

		UI.el.body.on('click', "#btn-add-another-sub", function () {
			var container = $("#subs-for-channel");
			container.append("<input type='text' placeholder='Extra subreddit'/>");
			container[0].scrollTop = container.height();
		});

		UI.el.mainWrap.on('click', '#btn-sub-man', function () {
			Modal.show(template.formInsert);
		});

		UI.el.mainWrap.on('click', '#btn-more-subs', function (ev) {
			var target = ev.target;
			$(target).remove();
			var main = UI.el.mainWrap;
			main.append(UI.template.loader);
			$.ajax({
				url: URLs.init + 'reddits/' + URLs.end + '&after=' + idLast,
				dataType: 'jsonp',
				success: function success(list) {
					var newSubs = Mustache.to_html(template.toAddList, list.data);
					idLast = list.data.after;
					$('.loader', main).remove();
					main.append(newSubs).append(template.loadMoreSubsButton);
					loadedSubs = loadedSubs + newSubs;
				},
				error: function error() {
					$('.loader').addClass('loader-error').text('Error loading more subreddits.');
				}
			});
		});

		UI.el.mainWrap.on('click', '.btn-add-sub', function (ev) {
			ev.preventDefault();
			var parent = $(this).parent(),
			    subTitle = $(".js-sub-title", parent);
			subTitle.css("color", "#2b9900"); // 'adding sub' little UI feedback
			var newSub = subTitle.text();
			add(newSub);
		});

		UI.el.mainWrap.on('click', '.btn-remove-sub', function (ev) {
			ev.preventDefault();
			remove(this.dataset.name);
		});
	};

	// Exports
	return {
		getList: getList,
		getAllSubsString: getAllSubsString,
		setEditing: setEditing,
		isEditing: isEditing,
		loadPosts: loadPosts,
		loadForEditing: loadForEditing,
		loadForAdding: loadForAdding,
		loadSaved: loadSaved,
		initListeners: initListeners,
		template: {
			formInsert: template.formInsert
		}
	};
})();

/* global
 $$,
 Store,
 El,
 is,
 Comments,
 Subreddits,
 Channels,
 Posts,
 Footer,
 Header,
 Menu,
 Modal,
 SortSwitch,
 CurrentSelection,
 UI,
 Backup,
 URLs,
 ThemeSwitcher,
 LinkSummary,
 FastClick
*/

// Init all modules listeners
UI.initListeners();
Posts.initListeners();
Comments.initListeners();
Subreddits.initListeners();
Channels.initListeners();
Menu.initListeners();
Header.initListeners();
Modal.initListeners();
SortSwitch.initListeners();
Backup.initListeners();
LinkSummary.initListeners();

Header.el.postTitle.remove();

if (is.wideScreen) {
	Footer.el.postTitle.text('');
}

CurrentSelection.loadSaved();

Subreddits.loadSaved();
Channels.loadSaved();

if (location.hash) {
	Comments.navigateFromHash();
}

CurrentSelection.execute(function () {
	// If it's a subreddit
	var currentSubName = CurrentSelection.getName();
	Menu.markSelected({ name: currentSubName });
	// Load links
	if (currentSubName.toUpperCase() === 'frontPage'.toUpperCase()) {
		CurrentSelection.setSubreddit('frontPage');
		Posts.load(URLs.init + "r/" + Subreddits.getAllSubsString() + "/");
	} else {
		Posts.load(URLs.init + "r/" + currentSubName + "/");
	}
	UI.setSubTitle(currentSubName);
}, function () {
	// If it's a channel
	var channel = Channels.getByName(CurrentSelection.getName());
	Menu.markSelected({ type: 'channel', name: channel.name });
	Channels.loadPosts(channel);
});

ThemeSwitcher.init();

if (is.mobile) {

	UI.scrollTop();

	var touch = 'touchmove';

	$$.id("edit-subs").addEventListener(touch, function (e) {
		e.preventDefault();
	}, false);

	document.getElementsByTagName('header')[0].addEventListener(touch, function (e) {
		if (Menu.isShowing()) {
			e.preventDefault();
		}
	}, false);

	if (is.iPad) {
		UI.iPadScrollFix();
	}

	if (is.iOS7) {
		document.body.classList.add("ios7");
	}
}

FastClick.attach(document.body);

})();