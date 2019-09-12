import './TileGroup.scss';

import classnames from 'classnames';
import * as React from 'react';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import { TileGroup, getPositionForTile, Tile } from '~core/tile';

import { useTileScene } from '../context';
import { useDragInTileScene } from '../hooks/useDragInTileScene';

import TileArea from './TileArea';
import { autorun, runInAction } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { addVector2, subVector2 } from '~utils/vector';
import { LAYERS } from '~core/layer';
import TileBlock from './TileBlock';

interface Props {
  children?: JSX.Element | null;
  className?: string;
  tileGroup: TileGroup;
  highlight?: boolean;
  draggable?: boolean;
  useTileBlock?: boolean;

  onDragStart?: (e?: TransformedEvent) => void;
  onDragSuccess?: () => void;

  renderTileBlockChildren?: (t: Tile) => JSX.Element;
}

export default function TileGroup({
  children,
  className,
  tileGroup,
  highlight = false,
  draggable = true,
  useTileBlock = false,
  onDragStart,
  onDragSuccess,

  renderTileBlockChildren
}: Props): JSX.Element {
  const tileScene = useTileScene();
  const [canDrop, setCanDrop] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);

  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragBind = draggable
    ? useDragInTileScene(ref, tileGroup, {
        onDragStart: e => {
          setDragging(true);

          if (onDragStart) {
            onDragStart(e);
          }
        },
        onDrag: (c: boolean) => {
          if (c !== canDrop) {
            setCanDrop(c);
          }
        },
        onDragEnd: () => {
          setDragging(false);
        },
        onDropSuccess: (tile: Vector2) => {
          runInAction(() => {
            const moved = subVector2(tile, tileGroup.tile);

            tileGroup.tile = tile;

            if (tileGroup.children.length) {
              tileGroup.children.forEach(cg => {
                cg.tile = addVector2(cg.tile, moved);
              });
            }
          });

          if (onDragSuccess) {
            onDragSuccess();
          }
        },
        onDropReset: () => {
          if (!canDrop) {
            setCanDrop(true);
          }
        }
      })
    : () => ({});

  React.useEffect(() => {
    if (ref.current) {
      tileScene.tileGroups.set(tileGroup, ref.current);
    }

    return () => {
      tileScene.tileGroups.delete(tileGroup);
    };
  }, [tileGroup]);

  React.useEffect(() => {
    const dispose = autorun(() => {
      if (ref.current) {
        const p = getPositionForTile(tileScene, tileGroup.tile);
        ref.current.style.transform = `translate3D(${p[0]}px, ${p[1]}px, 0)`;
      }
    });

    return () => {
      dispose();
    };
  }, [tileGroup, tileScene]);

  return (
    <Observer>
      {() => (
        <div
          className={classnames('tile-group', className, {
            'can-not-drop': !canDrop,
            dragging,
            highlight
          })}
          style={{ zIndex: dragging ? LAYERS.dragging : tileGroup.layer }}
          ref={ref}
        >
          <div className="tile-areas">
            {useTileBlock
              ? tileGroup.blocks.map((t, i) => (
                  <TileBlock
                    key={i}
                    tile={t}
                    dragBind={dragBind}
                    renderChild={renderTileBlockChildren}
                  />
                ))
              : tileGroup.areas.map((a, i) => <TileArea area={a} key={i} dragBind={dragBind} />)}
          </div>
          <div className="children" {...dragBind()}>
            {children}
          </div>
        </div>
      )}
    </Observer>
  );
}
