import * as React from 'react';
import { autorun } from 'mobx';

import { globalClock } from '~observables';
import { getTopCenterXY } from '~utils/draw';
import { useStore } from './store';

export default function Links() {
  const store = useStore();
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D;

      const subs = globalClock.subscribe(() => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        store.links.forEach(({ from, to }) => {
          const fromEl = store.slotUIElements.get(from);
          const toEl = store.slotUIElements.get(to);

          if (fromEl && toEl) {
            const fromPos = getTopCenterXY(fromEl);
            const toPos = getTopCenterXY(toEl);

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(...fromPos);
            ctx.lineTo(...toPos);
            ctx.stroke();
            ctx.closePath();
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
      className="fixed top-0 left-0"
      ref={canvas}
      height={window.innerHeight}
      width={window.innerWidth}
    />
  );
}
