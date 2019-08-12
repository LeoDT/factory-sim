import * as React from 'react';

import { drawClock } from '~observables';
import { getTopCenterXY } from '~utils/draw';
import { useStore } from './store';

export default function Links() {
  const store = useStore();
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D;

      const subs = drawClock.subscribe(() => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        store.links.forEach(({ from, to, holding }) => {
          const fromEl = store.slotUIElements.get(from);
          const toEl = store.slotUIElements.get(to);

          if (fromEl && toEl) {
            const fromPos = getTopCenterXY(fromEl);
            const toPos = getTopCenterXY(toEl);

            ctx.strokeStyle = holding.resource ? 'red' : 'black';
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
