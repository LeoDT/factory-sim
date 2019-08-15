import * as React from 'react';

export function createContextNoNullCheck<T>(): [() => T, React.Context<T | undefined>] {
  const context = React.createContext<T | undefined>(undefined);

  function useContext(): T {
    const c = React.useContext(context);
    if (!c) throw new Error('useContext must be inside a Provider with a value');
    return c;
  }

  return [useContext, context];
}
