import * as React from 'react';
import { hot } from 'react-hot-loader';

import { makeTileScene } from '~core/tile';
import { getNodeTypeById } from '~core/node';
import { getStorageTypeById } from '~core/storage';
import { sendToGlobals } from '~utils/debug';

import { TileSceneContext, StoreContext } from './context';
import { Store } from './store';

import Scene from './Scene';
import Status from './Status';

const TILE_SIZE = 40;

function Game(): JSX.Element {
  const [store] = React.useState(() => new Store());
  const [tileScene] = React.useState(() => makeTileScene(TILE_SIZE));

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      sendToGlobals({ store, tileScene });
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
      <TileSceneContext.Provider value={tileScene}>
        <div
          className="relative h-screen w-screen"
          onMouseDown={(e: React.BaseSyntheticEvent<MouseEvent, HTMLDivElement>) => {
            const { ui } = store;

            if (ui.selectedEl && !ui.selectedEl.contains(e.target) && ui.selectedEl !== e.target) {
              ui.unselect();
            }
          }}
        >
          <div className="relative h-screen w-screen pb-12">
            <Scene />
          </div>
          <div className="absolute left-0 bottom-0 h-12 w-screen bg-gray-300">
            <Status />
          </div>
        </div>
      </TileSceneContext.Provider>
    </StoreContext.Provider>
  );
}

export default hot(module)(Game);
