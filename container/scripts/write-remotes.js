// Writes dist/remotes.json for a deployed environment. It is plain Node with no dependencies,
// so any CI (GitHub Actions, GitLab, Jenkins, a laptop) can run it. Only two inputs are needed:
//   PUBLIC_BASE_URL  where the apps live, e.g. https://user.github.io/repo
//   VERSION          any unique string, usually the commit sha. It busts the browser cache of remoteEntry.js.
const fs = require('fs');
const path = require('path');

const base = process.env.PUBLIC_BASE_URL.replace(/\/$/, '');

const config = {
  version: process.env.VERSION || String(Date.now()),
  remotes: {
    login: `${base}/login/remoteEntry.js`,
    cart: `${base}/cart/remoteEntry.js`,
  },
};

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'remotes.json'), JSON.stringify(config, null, 2));
console.log('remotes.json', config);
