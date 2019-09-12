import classnames from 'classnames';
import * as React from 'react';

import { Observer } from 'mobx-react-lite';

import { transformTranslate } from '~utils/dom';
import { addVector2 } from '~utils/vector';

import { useStore, useTileScene } from './context';
import TileGroup from './Tile/TileGroup';
import {
  getSnappedPosition,
  getTileForPosition,
  canTileGroupMoveToTile,
  rotateTileGroup
} from '~core/tile';
import { autorun } from 'mobx';
import { LAYERS } from '~core/layer';

export default function Holding(): JSX.Element {
  const tileScene = useTileScene();
  const store = useStore();
  const { ui } = store;
  const ref = React.useRef<HTMLDivElement>(null);
  const move = React.useCallback(
    (e: MouseEvent) => {
      if (ref.current && ui.holding.get()) {
        const offset = getSnappedPosition(
          tileScene,
          addVector2([e.clientX, e.clientY], tileScene.viewport.xy)
        );

        ref.current.style.visibility = 'visible';
        transformTranslate(ref.current, offset);
      }
    },
    [ui]
  );

  const click = React.useCallback(
    (e: MouseEvent) => {
      const holding = ui.holding.get();

      if (ref.current && holding) {
        const offset = getSnappedPosition(
          tileScene,
          addVector2([e.clientX, e.clientY], tileScene.viewport.xy)
        );
        const tile = getTileForPosition(tileScene, offset);

        const canDrop = canTileGroupMoveToTile(tileScene, holding.tileGroup, tile);

        if (canDrop) {
          store.addThingOrBoard(holding, tile, true);
          ui.unhold();

          ref.current.style.visibility = 'hidden';
        }
      }
    },
    [ui]
  );

  const rotate = React.useCallback(
    (e: KeyboardEvent) => {
      const holding = ui.holding.get();

      if (holding && e.key === 'r') {
        rotateTileGroup(holding.tileGroup);
      }
    },
    [ui]
  );

  React.useEffect(() => {
    const dispose = autorun(() => {
      if (ui.holding.get()) {
        window.addEventListener('mousemove', move);
        window.addEventListener('click', click);
        document.addEventListener('keypress', rotate);
      } else {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('click', click);
        document.removeEventListener('keypress', rotate);
      }
    });

    return () => {
      dispose();
    };
  }, [ui]);

  return (
    <div
      className="holding"
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0.5,
        zIndex: LAYERS.dragging
      }}
    >
      <Observer>
        {() => {
          const h = ui.holding.get();

          let children = <></>;
          if (h) {
            switch (h._type) {
              case 'Node':
                children = (
                  <TileGroup
                    className={classnames('node-tile-group', h.nodeType.color)}
                    tileGroup={h.tileGroup}
                    draggable={false}
                  />
                );
                break;

              case 'Board':
                children = (
                  <TileGroup
                    className={classnames('board-tile-group', h.boardType.color)}
                    tileGroup={h.tileGroup}
                    draggable={false}
                  />
                );
                break;

              default:
                break;
            }
          }

          return children;
        }}
      </Observer>
    </div>
  );
}
