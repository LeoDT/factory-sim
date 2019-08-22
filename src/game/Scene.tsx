import './Scene.scss';

import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { useStore } from './context';
import Links from './Links';
import Node from './Node';
import Storage from './Storage';

export default function Scene(): JSX.Element {
  const store = useStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const getCanvas = React.useCallback(() => canvasRef, []);

  React.useEffect(() => {
    const sub = store.ui.windowResize.subscribe(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div className="scene">
      <canvas className="draw-canvas" ref={canvasRef} />
      <Links getCanvas={getCanvas} />
      <Observer>
        {() => (
          <>
            {store.nodes.map(n => (
              <Node node={n} key={n.id} />
            ))}
            {store.storages.map(s => (
              <Storage storage={s} key={s.id} />
            ))}
          </>
        )}
      </Observer>
    </div>
  );
}
