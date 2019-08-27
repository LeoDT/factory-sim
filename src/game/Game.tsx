import './Game.scss';

import * as React from 'react';
import { hot } from 'react-hot-loader';

import { makeTileScene } from '~core/tile';
import { sendToGlobals } from '~utils/debug';

import { TileSceneContext, StoreContext } from './context';
import { Store } from './store';

import Scene from './Scene';
import Status from './Status';

const TILE_SIZE = 40;
const SCENE_SIZE: Vector2 = [60, 60];

function Game(): JSX.Element {
  const [store] = React.useState(() => new Store());
  const [tileScene] = React.useState(() =>
    makeTileScene(TILE_SIZE, SCENE_SIZE, [window.innerWidth, window.innerHeight])
  );

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      sendToGlobals({ store, tileScene });
    }
  }, [store]);

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
