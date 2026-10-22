import { createApp } from 'vue';
import CartApp from './CartApp.vue';

/**
 * Same contract as the React login. The host cannot tell that this one is Vue.
 */
export function mount(element, props = {}) {
  const app = createApp(CartApp, props);
  app.mount(element);
  return () => app.unmount();
}
