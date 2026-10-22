# MFE Shop

A tiny online shop built from three independent micro frontends:

| App         | Tech    | Dev URL               | What it does                                       |
| ----------- | ------- | --------------------- | -------------------------------------------------- |
| `container` | React   | http://localhost:3000 | Shell: header, product list, theme, loads the rest |
| `login`     | React   | http://localhost:3001 | Sign in / sign out (mock user)                     |
| `cart`      | Vue 3   | http://localhost:3002 | Cart lines, quantities, total, checkout            |

Each folder is a separate project with its own `package.json`, lockfile and webpack config.
It can be built, run and deployed without the other two.

## Run locally

```bash
pnpm install          # root, only installs "concurrently"
pnpm install:all      # installs each app
pnpm dev              # starts all three dev servers
```

Open http://localhost:3000. Open :3001 or :3002 to see a remote running standalone.

## How it works

```
                 remotes.json  (which URL + version for each remote)
                      │
  container ──fetch───┘
      │
      ├── loadRemote(login)  ──> login/remoteEntry.js ──> mount(el)   (React, reuses container's React)
      └── loadRemote(cart)   ──> cart/remoteEntry.js  ──> mount(el)   (Vue)

  window CustomEvents: mfe:auth:login · mfe:auth:logout · mfe:cart:add · mfe:cart:changed
```

1. **Webpack Module Federation.** Each remote builds a `remoteEntry.js`. All apps list `react`, `react-dom`
   and faker under `shared` with `singleton: true`, so the browser downloads them once (check the Network tab:
   React only comes from :3000).
2. **Runtime remotes.** The container has no remote URLs baked into its build. It reads `remotes.json` at
   startup (`container/src/federation/loadRemote.js`). Change that file and the same build points somewhere else.
3. **One contract.** Every remote exposes `./mount` with `mount(element, props) => unmount`. The container's
   `RemoteApp` component does not know if it is React or Vue.
4. **Events, not imports.** Apps talk through `window` CustomEvents (`src/events.js`, copied in each app on purpose).
5. **Theming from the host.** `container/src/theme.css` defines `--mfe-*` CSS variables. Remotes only use
   `var(--mfe-color-primary, <fallback>)`. Any other host can restyle them by defining the same variables.
   Click "Theme" in the header to see all three apps repaint.
6. **Mock data.** `@faker-js/faker` with a fixed seed gives the same products every time.

## Deploy (free, GitHub Pages)

One-time setup:

1. Push this folder to a GitHub repo with a `main` branch.
2. The first workflow run creates the `gh-pages` branch.
3. Repo Settings → Pages → Source: "Deploy from a branch", branch `gh-pages`, folder `/ (root)`.

Result: `https://<user>.github.io/<repo>/` (container), `/login/` and `/cart/` (remotes, also usable standalone).

Pipelines in `.github/workflows`:

| Workflow           | Runs when                                       | Publishes to   |
| ------------------ | ----------------------------------------------- | -------------- |
| `Deploy login`     | push that changes `login/**`                    | `gh-pages/login` |
| `Deploy cart`      | push that changes `cart/**`                     | `gh-pages/cart`  |
| `Deploy container` | push to `container/**` **or** after login/cart deploys | `gh-pages/` root |

The container redeploy writes a new `version` into `remotes.json`, which busts the cache of `remoteEntry.js`.

### Hosting somewhere else

Nothing in the code depends on GitHub. Build each app (`pnpm build`), upload the three `dist` folders anywhere
static (Netlify, S3, nginx), then generate the container's `remotes.json`:

```bash
cd container
PUBLIC_BASE_URL=https://my-cdn.example.com VERSION=42 pnpm write-remotes
```

In GitHub Actions you can do the same by setting the repository variable `PUBLIC_BASE_URL`.

## Demo script

1. Show the shop, add items, log in. Checkout becomes enabled (login → cart through an event).
2. Toggle the theme. Three apps, two frameworks, one look.
3. DevTools → Network: `react` is downloaded once, login only downloads its own small chunk.
4. Open `/cart/` alone: same cart, its own fallback colors.
5. Change a text in `cart/src/CartApp.vue`, push. Watch `Deploy cart` then `Deploy container` run. Reload the shop.
