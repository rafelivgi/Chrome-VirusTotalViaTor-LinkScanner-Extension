// Copyright 2015 Rafel Ivgi. All Rights Reserved.

/**
 * @fileoverview Automating online scanning with VirusTotal as a Chrome Extension.
 * Allows automatic URL and Download scanning in VirusTotal.
 * @author rafelivgi@gmail.com (Rafel Ivgi)
 * @support admin@ironchrome.co.il (Nimrod Levy)
 */


// Add the "contains" function to the JavaScript Array object
Array.prototype.contains = function(obj) {
	try {
		var i = this.length;
		while (i--) {
			if (this[i] == obj) {
				return true;
			}
		}
	}
	catch (e)
	{
	}
	return false;
}


// Add the "contains" function to the JavaScript Array object
Array.prototype.remove = function(obj) {
	try {
		var index = this.indexOf(obj);
		if (index > -1) {
			this.splice(index, 1);
		}
	}
	catch (e)
	{
	}
    return false;
}


// Set uninstall URL so we can get user feedback and learn from our mistakes
chrome.runtime.setUninstallURL("http://www.ironchrome.co.il/linkscanner_uninstall_feedback.php");


// JavaScript "Sleep" (Delay/Wait) function
function sleep(seconds) {
	try {
		var start = new Date().getTime();
		while (new Date() < start + seconds * 1000) {}
	}
	catch (e)
	{
	}
	return false;
}


// Start/Run Process Tor.exe
try {	
	chrome.tabs.create({'url': 'tor://'}, function(curTabId) {
			sleep(0.500);
			chrome.tabs.remove(curTabId.id);
	});
}
catch (e)
{
}


// Define LinkScanner Object
if (!Israeli_IronChromeLinkScanner) {
  var Israeli_IronChromeLinkScanner = {};
};


// Force all Chrome tabs making all connections using all protocols to go through Tor
// DNS might still leak!!! unless the following command line is used:
// --host-resolver-rules="MAP * 0.0.0.0 , EXCLUDE myproxy"
// If your proxy is running localy (liek Tor)
// then: --host-resolver-rules="MAP * 0.0.0.0 , EXCLUDE 127.0.0.1"
// --proxy-server="socks5://127.0.0.1:9050"
function TORify() {
	try {
		var config = {
		  mode: "fixed_servers",
		  rules: {
			singleProxy: {
			  scheme: "socks5",
			  host: "127.0.0.1",
			  port: 9050
			}    
		  }
		};

		chrome.proxy.settings.set({value:config, scope:"regular"});
	}
	catch (e)
	{
	}
}


// Force all Chrome tabs to connect directly, WITHOUT Tor
function unTORify() {
	// Return to normal mode "Direct" no proxy
	chrome.proxy.settings.set({value:{mode:"direct"}, scope:"regular"});
}


// The list of all the Tab IDs which are currently opened via TOR
var TORifiedTabs = [];


/**
 * The Chrome Context Menu label for the extension item.
 * @type {string}
 */
Israeli_IronChromeLinkScanner.title = 'Israeli-IronChrome: Scan *Anonymously* in VirusTotal';


/**
 * VirusTotal's base url, to make the rest of the paths relative to this one.
 * @type {string}
 */
Israeli_IronChromeLinkScanner.mainsite = 'https://www.virustotal.com';


/**
 * VirusTotal's URL scanning url endpoint.
 * @type {string}
 */
Israeli_IronChromeLinkScanner.scansite = Israeli_IronChromeLinkScanner.mainsite + '/url/submission/';


/**
 * VirusTotal's searching functionality endpoint.
 * @type {string}
 */
Israeli_IronChromeLinkScanner.searchsite = Israeli_IronChromeLinkScanner.mainsite + '/search/?query=';


/**
 * Submits a URL to VirusTotal for scanning, does not show the rescan dialog.
 * @param {string} url The url that should be scanned with VirusTotal.
 */
Israeli_IronChromeLinkScanner.forceScan = function(url) {
	try {
		var parameters = '?force=1&url=' + url;
		
		TORify();
		chrome.tabs.create({'url': Israeli_IronChromeLinkScanner.scansite + parameters}, function(curTabId) {
			TORifiedTabs.push(curTabId.id);

			chrome.tabs.onRemoved.addListener(function (tabId) {
		   
			   if (TORifiedTabs.contains(tabId)) {
					unTORify();
					TORifiedTabs.remove(tabId);
			   }

			});

		});
	}
	catch (e)
	{
	}
};


/**
 * Submits a URL to VirusTotal for scanning, does not show the rescan dialog.
 * @param {string} term A candidate comment tag or a file hash (md5, sha1,
 *     sha256).
 */
Israeli_IronChromeLinkScanner.searchTerm = function(term) {
	try {
		var stripped_term = term.replace(/^\s+|\s+$/g, '');

		TORify();
		chrome.tabs.create({'url': Israeli_IronChromeLinkScanner.searchsite + stripped_term}, function(curTabId2) {
			TORifiedTabs.push(curTabId2.id);

			chrome.tabs.onRemoved.addListener(function (tabId) {
			   
			   if (TORifiedTabs.contains(tabId2)) {
					unTORify();
					TORifiedTabs.remove(tabId2);
			   }

			});

		});
	}
	catch (e)
	{
	}
};


/**
 * Checks a given Chrome element with VirusTotal.
 * @param {OnClickData} info Information sent when VirusTotal's context menu
 *     item is clicked.
 * @param {tabs.Tab} tab The details of the tab where the click took place.
 */
Israeli_IronChromeLinkScanner.check = function(info, tab) {
	try {
		//TORifying from here avoids the rare race condition between set-proxy and tab load
		TORify();

		if (info.linkUrl !== undefined) {
			Israeli_IronChromeLinkScanner.forceScan(info.linkUrl);
		} else if (info.selectionText !== undefined) {
			Israeli_IronChromeLinkScanner.searchTerm(info.selectionText);
		}
	}
	catch (e)
	{
	}
};


/**
 * Scan the current site being viewed by the user with VirusTotal.
 */
Israeli_IronChromeLinkScanner.scanCurrentURL = function() {
	try {
		//TORifying from here avoids the rare race condition between set-proxy and tab load
		TORify();

		chrome.windows.getCurrent(function(w) {
			chrome.tabs.getSelected(null, function(response) {
				Israeli_IronChromeLinkScanner.forceScan(response.url);
			});
		});
	}
	catch (e)
	{
	}
};


// Add context menu entry to scan links in VirusTotal via Tor
try {
	chrome.contextMenus.create({'title': Israeli_IronChromeLinkScanner.title,
                            'contexts': ['link', 'selection'],
                            'onclick': Israeli_IronChromeLinkScanner.check});
}
catch (e)
{
}
