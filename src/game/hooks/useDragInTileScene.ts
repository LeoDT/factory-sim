import { MutableRefObject } from 'react';
import { useDrag } from 'react-use-gesture';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import {
  getSnappedPosition,
  getTileForPosition,
  TileGroup,
  canTileGroupMoveToTile,
  getPositionForTile
} from '~core/tile';
import { useTileScene } from '~game/context';

export function useDragInTileScene(
  elRef: MutableRefObject<HTMLElement | null>,
  tileGroup: TileGroup,
  options: {
    onDragStart?: (e?: TransformedEvent) => void;
    onDrag?: (canDrop: boolean) => void;
    onDragEnd?: () => void;
    onDropSuccess?: (tile: Vector2) => void;
    onDropReset?: () => void;
  }
): ReturnType<typeof useDrag> {
  const tileScene = useTileScene();
  const dragBind = useDrag(
    ({ event, initial, xy, last, first, memo = { toLeft: 0, toTop: 0, inited: false } }) => {
      if (elRef.current) {
        if (first) {
          if (options.onDragStart) {
            options.onDragStart(event);
          }
        }

        const el = elRef.current;

        if (!memo.inited) {
          const { top, left } = el.getBoundingClientRect();

          memo.toLeft = initial[0] - left;
          memo.toTop = initial[1] - top;
          memo.inited = true;
        }

        const p = getSnappedPosition(tileScene, [xy[0] - memo.toLeft, xy[1] - memo.toTop]);

        el.style.transform = `translate3D(${p[0]}px, ${p[1]}px, 0)`;

        const newTile = getTileForPosition(tileScene, p);
        const canDrop = canTileGroupMoveToTile(tileScene, tileGroup, newTile);

        if (last) {
          if (canDrop) {
            if (options.onDropSuccess) {
              options.onDropSuccess(newTile);
            }
          } else {
            const oldP = getSnappedPosition(
              tileScene,
              getPositionForTile(tileScene, tileGroup.tile)
            );
            el.style.transform = `translate3D(${oldP[0]}px, ${oldP[1]}px, 0)`;

            if (options.onDropReset) {
              options.onDropReset();
            }
          }

          if (options.onDragEnd) {
            options.onDragEnd();
          }
        } else {
          if (options.onDrag) {
            options.onDrag(canDrop);
          }
        }

        return memo;
      }
    }
  );

  return dragBind;
}
