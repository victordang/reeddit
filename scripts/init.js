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
 URLs
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

CurrentSelection.execute(
	function() { // If it's a subreddit
		var currentSubName = CurrentSelection.getName();
		Menu.markSelected({name: currentSubName});
		// Load links
		if (currentSubName.toUpperCase() === 'frontPage'.toUpperCase()) {
			CurrentSelection.setSubreddit('frontPage');
			Posts.load(URLs.init + "r/" + Subreddits.getAllSubsString() + "/");
		} else {
			Posts.load(URLs.init + "r/" + currentSubName + "/");
		}
		UI.setSubTitle(currentSubName);
	}, function() { // If it's a channel
		var channel = Channels.getByName(CurrentSelection.getName());
		Menu.markSelected({type: 'channel', name: channel.name});
		Channels.loadPosts(channel);
	});

var loadMnml = Store.getItem('mnml'),
	isMnml = loadMnml ? JSON.parse(loadMnml) : false;

UI.switchMnml(false, isMnml);

if (is.mobile) {

	UI.scrollTop();

	var touch = 'touchmove';

	$$.id("edit-subs").addEventListener(touch, function(e) {
		e.preventDefault();
	}, false);

	document.getElementsByTagName('header')[0].addEventListener(touch, function(e) {
		if (Menu.isShowing()) {
			e.preventDefault();
		}
	}, false);

	if (is.iPad) {
		UI.iPadScrollFix();
	}

	if (is.iOS7) {
		// apply iOS 7+ theme
		if (!isMnml) {
			UI.switchMnml(true, true);
		}
		document.body.classList.add("ios7");
	}
}

if (is.mobile || !is.mozStandalone) {
	// Insert Dropbox Drop-ins
	let dropboxScript = document.createElement('script');
	dropboxScript.src = 'https://www.dropbox.com/static/api/1/dropins.js';
	dropboxScript.id = 'dropboxjs';
	dropboxScript.setAttribute('data-app-key', 'yiu8cok9mknii0n');
	document.body.appendChild(dropboxScript);
}
