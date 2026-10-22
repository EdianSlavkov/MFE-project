import { useEffect, useRef, useState } from 'react';
import { loadRemote } from '../federation/loadRemote';

// Generic slot for ANY micro frontend. It does not care whether the remote is React, Vue or plain JS.
// The only contract is: the remote exposes "./mount" with mount(element, props) that returns an unmount function.
export default function RemoteApp({ remote, props }) {
  const ref = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unmount;
    // Guards against the component being removed before the remote finished downloading.
    let cancelled = false;

    loadRemote(remote)
      .then(({ mount }) => {
        if (!cancelled) unmount = mount(ref.current, props);
      })
      .catch(setError);

    return () => {
      cancelled = true;
      // Deferred, because unmounting a nested React root while React is still committing logs a warning.
      if (unmount) setTimeout(unmount);
    };
  }, [remote.url]);

  // A broken remote must not take the whole shop down. We show a small message and keep going.
  if (error) return <div className="shell-remote-error">{remote.scope} is unavailable right now.</div>;
  return <div ref={ref} />;
}
