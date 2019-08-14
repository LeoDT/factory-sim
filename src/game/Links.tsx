import * as React from 'react';

import { drawClock } from '~core/clocks';
import { getCenterCenterXY } from '~utils/draw';
import { useStore } from './store';

export default function Links() {
  const store = useStore();
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D;

      const subs = drawClock.subscribe(() => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        store.links.forEach(({ from, to, holding, cycler }) => {
          const fromEl = store.portUIElements.get(from);
          const toEl = store.portUIElements.get(to);

          if (fromEl && toEl) {
            const fromPos = getCenterCenterXY(fromEl);
            const toPos = getCenterCenterXY(toEl);

            let style;
            switch (cycler.state) {
              case 'BUSY':
                style = 'red';
                break;
              case 'FINISH':
                style = 'green';
                break;
              default:
                style = 'gray';
                break;
            }

            ctx.strokeStyle = style;
            ctx.beginPath();
            ctx.moveTo(fromPos[0], fromPos[1]);
            ctx.lineTo(toPos[0], toPos[1]);
            ctx.stroke();
          }
        });
      });

      return () => {
        subs.unsubscribe();
      };
    }
  });

  return (
    <canvas
      className="absolute top-0 left-0 pointer-events-none z-50"
      ref={canvas}
      height={window.innerHeight}
      width={window.innerWidth}
    />
  );
}
