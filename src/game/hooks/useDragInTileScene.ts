import { MutableRefObject } from 'react';
import { useDrag } from 'react-use-gesture';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import {
  getSnappedPosition,
  getTileForPosition,
  TileGroup,
  canTileGroupMoveToTile,
  getPositionForTile,
  dragTileGroupToPosition
} from '~core/tile';
import { useTileScene } from '~game/context';
import { sameVector2 } from '~utils/vector';

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
    ({
      event,
      initial,
      xy,
      last,
      first,
      memo = { toLeft: 0, toTop: 0, inited: false, tile: tileGroup.tile, canDrop: false }
    }) => {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

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

        const p = getSnappedPosition(tileScene, [
          xy[0] - memo.toLeft + tileScene.viewport.xy[0],
          xy[1] - memo.toTop + tileScene.viewport.xy[1]
        ]);

        dragTileGroupToPosition(tileScene, tileGroup, p);

        const newTile = getTileForPosition(tileScene, p);

        if (!sameVector2(memo.tile, newTile)) {
          memo.canDrop = canTileGroupMoveToTile(tileScene, tileGroup, newTile);
        }

        memo.tile = newTile;

        if (last) {
          if (memo.canDrop) {
            if (options.onDropSuccess) {
              options.onDropSuccess(newTile);
            }
          } else {
            dragTileGroupToPosition(
              tileScene,
              tileGroup,
              getPositionForTile(tileScene, tileGroup.tile)
            );

            if (options.onDropReset) {
              options.onDropReset();
            }
          }

          if (options.onDragEnd) {
            options.onDragEnd();
          }
        } else {
          if (options.onDrag) {
            options.onDrag(memo.canDrop);
          }
        }

        return memo;
      }
    }
  );

  return dragBind;
}
