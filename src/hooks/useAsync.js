import { useCallback, useEffect, useState } from 'react';

export default function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let ignore = false;
    setState(s => ({ ...s, loading: true, error: null }));
    fn()
      .then(data => { if (!ignore) setState({ data, loading: false, error: null }); })
      .catch(error => { if (!ignore) setState({ data: null, loading: false, error }); });
    return () => { ignore = true; };  }, [...deps, nonce]);

  return { ...state, reload };
}
