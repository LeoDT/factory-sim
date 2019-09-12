import './Game.scss';

import * as React from 'react';
import { hot } from 'react-hot-loader';

import { makeTileScene } from '~core/tile';
import { boardTypes } from '~core/board';
import { sendToGlobals } from '~utils/debug';

import { TileSceneContext, StoreContext } from './context';
import { Store } from './store';

import Scene from './Scene';
import Status from './Status';

const TILE_SIZE = 40;
const SCENE_SIZE: Vector2 = [60, 60];

function Game(): JSX.Element {
  const [store, setStore] = React.useState(() => new Store());
  const [tileScene] = React.useState(() =>
    makeTileScene(TILE_SIZE, SCENE_SIZE, [window.innerWidth, window.innerHeight])
  );

  React.useEffect(() => {
    const store = new Store();

    const t1 = boardTypes.get(1);
    const t2 = boardTypes.get(2);
    const t3 = boardTypes.get(3);
    const t4 = boardTypes.get(4);

    if (t1 && t2 && t3 && t4) {
      store.addBoard(t1, [1, 1]);
      store.addBoard(t2, [1, 6]);
      store.addBoard(t3, [1, 11]);
      store.addBoard(t4, [21, 6]);
    }

    setStore(store);
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      sendToGlobals({ store, tileScene });
    }
  }, [store, tileScene]);

  return (
    <StoreContext.Provider value={store}>
      <TileSceneContext.Provider value={tileScene}>
        <div
          className="game"
          onMouseDown={(e: React.BaseSyntheticEvent<MouseEvent, HTMLDivElement>) => {
            const { ui } = store;

            if (ui.selectedEl && !ui.selectedEl.contains(e.target) && ui.selectedEl !== e.target) {
              ui.unselect();
            }

            if (ui.linkStartPort.get()) {
              setTimeout(() => {
                ui.linkStartPort.set(null);
              }, 100);
            }
          }}
        >
          <div className="main-scene">
            <Scene />
          </div>
          <div className="main-status">
            <Status />
          </div>
        </div>
      </TileSceneContext.Provider>
    </StoreContext.Provider>
  );
}

export default hot(module)(Game);
