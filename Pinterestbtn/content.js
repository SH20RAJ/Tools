/*
  remove new Date.getTime() in favor of Date.now
*/

((w, d, a) => {
  let $ = {
    w,
    d,
    a,
    b: chrome || browser,
    v: {
      // tag all Pinterest domains, not just the ones with three characters or less in the third-level domain
      pinterestTagPattern: /^https?:\/\/([a-z]*\.|)pinterest\.(at|(c(a|h|l|o(\.(kr|uk)|m(|\.(au|mx)))))|d(e|k)|es|fr|i(e|t)|jp|nz|p(h|t)|se|ru)\//,
    },
    f: {
      // console.log to background window
      debug: (o) => {
        if (o && $.v.debug) {
          console.log(o);
        }
      },
      // are we in the top frame?
      canHazLogic: () => {
        let r = false;
        // are we in the top frame?
        if ($.w.self === $.w.top) {
          // we're good
          r = true;
        } else {
          // can we run inside this iframe?
          $.f.debug('We are inside an iframe.');
          // this is in a try/catch block because looking at the parent window's size may trigger a cross-origin frame access warning
          try {
            if (
              $.w.top.innerHeight === $.w.self.innerHeight &&
              $.w.top.innerWidth === $.w.self.innerWidth
            ) {
              $.f.debug(
                'This iframe is the same size as the top window; allowing the extension to run.',
              );
              r = true;
            } else {
              $.f.debug(
                "This frame's dimensions: " + $.w.self.innerHeight + 'x' + $.w.self.innerWidth,
              );
              $.f.debug('Top window dimensions: ' + $.w.top.innerHeight + 'x' + $.w.top.innerWidth);
            }
          } catch (err) {
            $.f.debug(
              "This error message can be safely ignored. It was caught so it doesn't clutter up the console.",
            );
            $.f.debug(err);
          }
        }
        return r;
      },
      // tag window, write logic
      init: () => {
        $.d.b = $.d.getElementsByTagName('BODY')[0];
        // do we need to tag the page?
        if ($.d.b && $.d.URL) {
          // are we on a Pinterest domain?
          if ($.d.URL.match($.v.pinterestTagPattern)) {
            // tag so Pinterest knows the extension is installed
            $.f.debug('Setting tag on Pinterest domain.');
            $.d.b.setAttribute('data-pinterest-extension-installed', $.v.xv);
          } else {
            $.f.debug('Not on Pinterest; no tag set.');
          }
        }
        // we're injecting into all iframes because the bookmarklet grid comes up inside one and we need to tag it if it's a Pinterest domain
        // but we don't want to execute our business logic inside iframes, because there are potentially millions of them on a page
        // finally: be nice to sites that use framesets where one frame is a direct descendant of window.top and is 100% of the size of the window
        if ($.f.canHazLogic()) {
          $.b.runtime.sendMessage({
            to: 'background',
            act: 'injectLogic',
          });
        }
      },
    },
  };
  // get only what we need from local storage and init
  $.b.storage.local.get($.a.localValuesNeeded, function (data) {
    // quickly add all values returned to $.v, our array of globally-avilable variables
    $.a.localValuesNeeded.filter((item) => {
      $.v[item] = data[item];
    });
    $.f.init();
  });
})(window, document, {
  localValuesNeeded: ['xv', 'debug'],
});
