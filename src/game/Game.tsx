import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { hot } from 'react-hot-loader';

import { useStore } from './store';

import Node from './Node';
import Storage from './Storage';
import Links from './Links';

function Game() {
  const store = useStore();

  return (
    <div>
      <Links />
      <Observer>
        {() => (
          <>
            <div className="p-3 flex items-start justify-start">
              {store.nodes.map(n => (
                <Node node={n} key={n.id} />
              ))}
            </div>
            <div className="p-3 flex items-start justify-start">
              {store.storages.map(s => (
                <Storage storage={s} key={s.id} />
              ))}
            </div>
          </>
        )}
      </Observer>
    </div>
  );
}

export default hot(module)(Game);
