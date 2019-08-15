import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { hot } from 'react-hot-loader';

import { makeTileScene } from '~core/tile';
import { getNodeTypeById } from '~core/node';
import { getStorageTypeById } from '~core/storage';
import { sendToGlobals } from '~utils/debug';

import { TileSceneContext, StoreContext } from './context';
import { Store } from './store';

import Node from './Node';
import Storage from './Storage';
import Links from './Links';

function Game(): JSX.Element {
  const [store] = React.useState(() => new Store());
  const [nodeTileScene] = React.useState(() => makeTileScene(20));

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      sendToGlobals({ store });
    }
  }, [store]);

  React.useEffect(() => {
    function mock(): void {
      const nodeType1 = getNodeTypeById(1);
      const nodeType2 = getNodeTypeById(2);
      const nodeType3 = getNodeTypeById(3);
      const storageType = getStorageTypeById(1);

      if (nodeType1 && nodeType2 && nodeType3 && storageType) {
        const node1 = store.addNode(nodeType1);
        const node2 = store.addNode(nodeType2);
        const storage = store.addStorage(storageType);
        store.addLink(node1.outPort, storage.port);
        store.addLink(node2.outPort, storage.port);
        store.addLink(storage.port, node2.inPort);

        const node3 = store.addNode(nodeType3);
        store.addLink(storage.port, node3.inPort);
        store.addLink(node3.outPort, storage.port);
      }
    }

    mock();
  }, []);

  return (
    <StoreContext.Provider value={store}>
      <TileSceneContext.Provider value={nodeTileScene}>
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
      </TileSceneContext.Provider>
    </StoreContext.Provider>
  );
}

export default hot(module)(Game);
