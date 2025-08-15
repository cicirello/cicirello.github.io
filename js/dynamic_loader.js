// Loading from a script rather than inline so that I can use strict-dynamic with
// a hash in CSP, enabling AdSense to load whatever else it needs.
// IMPORTANT: If even 1 character changes in this file, a new hash will be necessary.
function loadScriptAsync(url, crossOriginMode = 'anonymous') {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
	s.src = url;
    s.crossOrigin = crossOriginMode; 
    document.head.appendChild(s);
  });
}
loadScriptAsync('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6813707428591829', 'anonymous');
