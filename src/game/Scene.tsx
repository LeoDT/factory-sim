import './Scene.scss';

import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { useGesture } from 'react-use-gesture';

import { subVector2 } from '~utils/vector';

import { transformTranslate } from '~utils/dom';
import { clampViewportOffset } from '~core/tile';

import { useStore, useTileScene } from './context';
import Links from './Links';
import Node from './Node';
import Storage from './Storage';
import Board from './Board';
import Slot from './Slot';
import Holding from './Holding';

export default function Scene(): JSX.Element {
  const tileScene = useTileScene();
  const store = useStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const getCanvas = React.useCallback(() => canvasRef, []);
  const bind = useGesture(({ delta, last }) => {
    if (gridRef.current) {
      const offset = clampViewportOffset(tileScene, subVector2(tileScene.viewport.xy, delta));

      transformTranslate(gridRef.current, offset, -1);

      if (last) {
        tileScene.viewport.setXY(offset);
      }
    }
  });

  React.useEffect(() => {
    const sub = store.ui.windowResize.subscribe(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }

      tileScene.viewport.dimension[0] = window.innerWidth;
      tileScene.viewport.dimension[1] = window.innerHeight;
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const dispose = autorun(() => {
      if (gridRef.current) {
        transformTranslate(gridRef.current, tileScene.viewport.xy, -1);
      }
    });

    return () => {
      dispose();
    };
  });

  return (
    <div className="scene" {...bind()}>
      <canvas className="draw-canvas" ref={canvasRef} />
      <Links getCanvas={getCanvas} />

      <Observer>
        {() => (
          <div
            className="grid"
            ref={gridRef}
            style={{
              width: tileScene.sceneDimension[0] + 1,
              height: tileScene.sceneDimension[1] + 1,
              backgroundSize: `${tileScene.tileSize}px ${tileScene.tileGroups}px`
            }}
          >
            {store.nodes.map(n => (
              <Node node={n} key={n.id} />
            ))}
            {store.boards.map(b => (
              <Board board={b} key={b.id} />
            ))}
            {store.slots.map(s => (
              <Slot slot={s} key={s.id} />
            ))}
            {store.storages.map(s => (
              <Storage storage={s} key={s.id} />
            ))}

            <Holding />
          </div>
        )}
      </Observer>
    </div>
  );
}
