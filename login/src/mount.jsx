import { createRoot } from 'react-dom/client';
import LoginApp from './LoginApp';

/**
 * The single public entry of this micro frontend.
 * The host only knows "give me a DOM element and I render myself", which hides that we use React.
 */
export function mount(element, props = {}) {
  const root = createRoot(element);
  root.render(<LoginApp {...props} />);
  // Returning the cleanup lets the host remove us without knowing anything about React roots.
  return () => root.unmount();
}
