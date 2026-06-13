// Realtime sync (R2) -- shared org-stream client.
//
// One EventSource per page to GET /api/v1/events/stream (the R1 SSE endpoint),
// multiplexed to local listeners. Consumers call OTPLive.subscribe({ topics,
// onEvent, onResync }) and react however they like (refetch a region, bump a
// badge, etc). The browser handles reconnect + Last-Event-ID natively.
//
// Resilient by design: gated on window.OTP_REALTIME_ENABLED (server-rendered
// from REALTIME_STREAM_ENABLED && authed). If the endpoint is off (404) or auth
// fails, we stop after a few attempts so consumers fall back to their existing
// polling -- no reconnect storm. flag OFF in prod today => this is inert.
(function () {
  if (window.OTPLive) return;

  var ENABLED = !!window.OTP_REALTIME_ENABLED;
  var listeners = [];      // { topics: string[]|null, onEvent, onResync }
  var es = null;
  var everConnected = false;
  var failures = 0;
  var MAX_FAILURES = 4;    // give up -> consumers keep polling

  function dispatchEvent(env) {
    for (var i = 0; i < listeners.length; i++) {
      var l = listeners[i];
      if (l.topics && l.topics.indexOf(env.topic) === -1) continue;
      try { if (l.onEvent) l.onEvent(env); } catch (e) { /* a bad listener must not break the rest */ }
    }
  }
  function dispatchResync(reason) {
    for (var i = 0; i < listeners.length; i++) {
      try { if (listeners[i].onResync) listeners[i].onResync(reason); } catch (e) { /* ignore */ }
    }
  }

  function connect() {
    if (!ENABLED || es || typeof EventSource === 'undefined') return;
    try {
      es = new EventSource('/api/v1/events/stream', { withCredentials: true });
    } catch (e) { ENABLED = false; return; }

    es.addEventListener('ready', function () { everConnected = true; failures = 0; });
    es.addEventListener('org-event', function (e) {
      var env; try { env = JSON.parse(e.data); } catch (err) { return; }
      dispatchEvent(env);
    });
    es.addEventListener('resync', function (e) {
      var reason = ''; try { reason = (JSON.parse(e.data) || {}).reason; } catch (err) {}
      dispatchResync(reason);
    });
    es.onerror = function () {
      // After connecting, transient drops auto-reconnect (browser handles it,
      // resending Last-Event-ID). Before ever connecting (flag off => 404, or
      // 401), stop after a few tries so we don't loop forever; consumers keep
      // their polling fallback.
      if (everConnected) return;
      failures++;
      if (failures >= MAX_FAILURES) {
        try { es.close(); } catch (e) {}
        es = null;
        ENABLED = false;
      }
    };
  }

  window.OTPLive = {
    enabled: function () { return ENABLED; },
    subscribe: function (opts) {
      opts = opts || {};
      var l = {
        topics: opts.topics ? [].concat(opts.topics) : null,
        onEvent: opts.onEvent || null,
        onResync: opts.onResync || null,
      };
      listeners.push(l);
      connect();
      return {
        unsubscribe: function () {
          var i = listeners.indexOf(l);
          if (i !== -1) listeners.splice(i, 1);
        },
      };
    },
  };
})();
