// The apps talk to each other only through browser CustomEvents on window.
// This is framework agnostic (React and Vue both understand it) and creates no code dependency:
// every app keeps its own tiny copy of this file instead of importing a shared package.
// The event names below are the public "contract" between the micro frontends.
export const EVENTS = {
  LOGIN: 'mfe:auth:login',
  LOGOUT: 'mfe:auth:logout',
  CART_ADD: 'mfe:cart:add',
  CART_CHANGED: 'mfe:cart:changed',
};

/**
 * Fires an app wide event that any micro frontend can listen to.
 */
export function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Subscribes to an app wide event and returns the unsubscribe function.
 */
export function on(name, handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
