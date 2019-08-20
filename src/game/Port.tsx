import * as React from 'react';
import classnames from 'classnames';
import { Observer, useLocalStore } from 'mobx-react-lite';

import { Port, canPortsBeLinked } from '~core/port';
import { useStore } from './context';

interface Props {
  port: Port;
  type: 'in' | 'out' | 'all';
}

export default function Port({ port, type }: Props): JSX.Element | null {
  const store = useStore();
  const { ui } = store;
  const local = useLocalStore(
    () => ({
      get canBeLinked(): boolean {
        const start = ui.linkStartPort.get();

        if (start) {
          return canPortsBeLinked(start, port);
        }

        return !start;
      }
    }),
    [port]
  );

  return port.slots.length === 0 ? (
    <div />
  ) : (
    <Observer>
      {() => (
        <div
          className={classnames(
            'rounded-full',
            ui.linkStartPort.get() === port ? 'h-3 w-3' : 'h-2 w-2',
            local.canBeLinked
              ? {
                  'bg-green-300': type === 'out',
                  'bg-red-300': type === 'in',
                  'bg-purple-300': type === 'all'
                }
              : 'bg-gray-300',
            local.canBeLinked ? 'relative z-40' : null
          )}
          onClick={() => {
            const start = ui.linkStartPort.get();
            if (start && canPortsBeLinked(start, port)) {
              store.addLink(start, port);
              ui.linkStartPort.set(null);
            } else {
              ui.linkStartPort.set(port);
            }
          }}
          ref={c => {
            if (c) store.updatePortUIElement(port, c);
          }}
        />
      )}
    </Observer>
  );
}
