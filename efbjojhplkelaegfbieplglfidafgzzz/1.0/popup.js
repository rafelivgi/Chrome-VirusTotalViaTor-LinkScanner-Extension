// Copyright 2015 Rafel Ivgi. All Rights Reserved.

/**
 * @fileoverview Functionality for VirusTotal official Chrome extension's
 * popup.html.
 * @author admin@ironchrome.co.il
 */

/**
 * VirusTotal's URL scanning url endpoint.
 * @param {event} e Click event when the "Scan current site" label is clicked.
 */
function scanCurrentClickHandler(e) {
  var bkg = chrome.extension.getBackgroundPage();
  bkg.Israeli_IronChromeLinkScanner.scanCurrentURL();
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#scan-current').addEventListener(
      'click', scanCurrentClickHandler);
});
