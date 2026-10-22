// Loads a remote app at RUNTIME. This is what makes the remotes truly independent:
// the container only needs a URL, which comes from remotes.json and not from the build.
// So when the cart is redeployed, the next page load simply gets the new cart.

// One promise per remote, so the same remoteEntry.js is never downloaded twice.
const containers = {};

/**
 * Adds a script tag and resolves when the browser has executed it.
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load remote from ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Downloads a remote's entry file, connects it to the shared dependency scope and returns one exposed module.
 */
export async function loadRemote({ url, scope, module }) {
  if (!containers[scope]) {
    containers[scope] = loadScript(url).then(async () => {
      // Make sure the container's own shared modules (React, faker...) are registered in the "default" scope.
      await __webpack_init_sharing__('default');
      // remoteEntry.js puts the remote on window under its federation "name" (e.g. window.cart).
      const remote = window[scope];
      // Hand our shared scope to the remote. From now on it will reuse our React instead of loading its own.
      await remote.init(__webpack_share_scopes__.default);
      return remote;
    });
  }
  const remote = await containers[scope];
  // get() returns a factory. Calling it gives the actual module exports, e.g. { mount }.
  const factory = await remote.get(module);
  return factory();
}
