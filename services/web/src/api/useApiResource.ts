import { useEffect, useRef, useState } from 'react';

export type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; value: T }
  | { status: 'data'; value: T };

export function useApiResource<T>(resourceKey: string, load: () => Promise<T>, isEmpty: (value: T) => boolean) {
  const loadRef = useRef(load);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    void loadRef.current().then((value) => {
      if (active) setState(isEmpty(value) ? { status: 'empty', value } : { status: 'data', value });
    }).catch((error: unknown) => {
      if (active) setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The request could not be completed.',
      });
    });
    return () => { active = false; };
  }, [resourceKey, attempt, isEmpty]);

  return { state, retry: () => setAttempt((value) => value + 1) };
}