import * as React from 'react';

import { nodeTypes } from '~core/node';
import { storageTypes } from '~core/storage';
import { useStore } from '~game/context';

export default function Tools(): JSX.Element {
  const store = useStore();
  const nodes: JSX.Element[] = [];
  const storages: JSX.Element[] = [];

  nodeTypes.forEach(t => {
    nodes.push(
      <div className="button" key={t.id} onClick={() => store.addNode(t)}>
        {t.name}
      </div>
    );
  });

  storageTypes.forEach(t => {
    storages.push(
      <div className="button" key={t.id} onClick={() => store.addStorage(t)}>
        {t.name}
      </div>
    );
  });

  return (
    <div className="status-tools">
      {nodes}
      {storages}
    </div>
  );
}
