import * as React from 'react';
import classnames from 'classnames';

import { Port } from '~core/port';
import { useStore } from './store';

interface Props {
  port: Port;
  type: 'in' | 'out' | 'all';
}

export default function Port({ port, type }: Props): JSX.Element {
  const store = useStore();

  return (
    <div
      className={classnames('h-2 w-2 rounded-full', {
        'bg-green-300': type === 'out',
        'bg-red-300': type === 'in',
        'bg-purple-300': type === 'all'
      })}
      ref={c => {
        if (c) store.updatePortUIElement(port, c);
      }}
    />
  );
}
