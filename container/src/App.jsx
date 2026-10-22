import { useEffect, useState } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import RemoteApp from './components/RemoteApp';
import { on, EVENTS } from './events';

/**
 * Turns remotes.json into the objects loadRemote expects.
 * The version is appended as a query string so a redeploy always busts the browser cache of remoteEntry.js.
 */
function toRemotes(config) {
  return Object.fromEntries(
    Object.entries(config.remotes).map(([scope, url]) => [
      scope,
      { scope, module: './mount', url: `${url}?v=${config.version}` },
    ]),
  );
}

export default function App() {
  const [remotes, setRemotes] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    // Relative URL and no-store: remotes.json sits next to index.html wherever the container is hosted
    // and must always be fresh, because it decides which version of every remote is loaded.
    fetch('./remotes.json', { cache: 'no-store' })
      .then((response) => response.json())
      .then((config) => setRemotes(toRemotes(config)));
  }, []);

  useEffect(() => {
    // The container listens to the same events as everybody else. It owns no login or cart logic.
    const offs = [
      on(EVENTS.LOGIN, setUser),
      on(EVENTS.LOGOUT, () => setUser(null)),
      on(EVENTS.CART_CHANGED, ({ count }) => setCartCount(count)),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  useEffect(() => {
    // Switching the theme is just one attribute. theme.css swaps the variables, all three apps repaint.
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'default' ? 'sunset' : 'default'));

  return (
    <>
      <Header user={user} cartCount={cartCount} theme={theme} onToggleTheme={toggleTheme} />
      <main className="shell-layout">
        <ProductList />
        <aside className="shell-sidebar">
          {remotes && (
            <>
              <RemoteApp remote={remotes.login} />
              <RemoteApp remote={remotes.cart} />
            </>
          )}
        </aside>
      </main>
    </>
  );
}
