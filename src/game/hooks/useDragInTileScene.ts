import { MutableRefObject } from 'react';
import { useDrag } from 'react-use-gesture';

import { getSnappedPosition } from '~core/tile';
import { useTileScene } from '~game/context';

export function useDragInTileScene(
  elRef: MutableRefObject<HTMLElement | null>
): ReturnType<typeof useDrag> {
  const tileScene = useTileScene();
  const dragBind = useDrag(({ initial, xy, memo = { toLeft: 0, toTop: 0, inited: false } }) => {
    if (elRef.current) {
      const el = elRef.current;

      if (!memo.inited) {
        const { top, left } = el.getBoundingClientRect();

        memo.toLeft = initial[0] - left;
        memo.toTop = initial[1] - top;
        memo.inited = true;
      }

      const [x, y] = getSnappedPosition(tileScene, [xy[0] - memo.toLeft, xy[1] - memo.toTop]);

      el.style.transform = `translate3D(${x}px, ${y}px, 0)`;

      return memo;
    }
  });

  return dragBind;
}
