import './TileGroup.scss';

import classnames from 'classnames';
import * as React from 'react';
import { TransformedEvent } from 'react-use-gesture/dist/types';

import { TileGroup, getPositionForTile } from '~core/tile';

import { useTileScene } from '../context';
import { useDragInTileScene } from '../hooks/useDragInTileScene';

import TileArea from './TileArea';
import { autorun } from 'mobx';

interface Props {
  children?: JSX.Element | null;
  className?: string;
  tileGroup: TileGroup;
  highlight?: boolean;

  onDragStart?: (e?: TransformedEvent) => void;
  onDragSuccess?: () => void;
}

export default function TileGroup({
  children,
  className,
  tileGroup,
  highlight = false,
  onDragStart,
  onDragSuccess
}: Props): JSX.Element {
  const tileScene = useTileScene();
  const [canDrop, setCanDrop] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);

  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragBind = useDragInTileScene(ref, tileGroup, {
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
      tileGroup.tile = tile;

      if (onDragSuccess) {
        onDragSuccess();
      }
    },
    onDropReset: () => {
      if (!canDrop) {
        setCanDrop(true);
      }
    }
  });

  React.useEffect(() => {
    tileScene.tileGroups.push(tileGroup);

    return () => {
      tileScene.tileGroups.remove(tileGroup);
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
    <div
      className={classnames('tile-group', className, {
        'can-not-drop': !canDrop,
        dragging,
        highlight
      })}
      style={{ zIndex: tileGroup.layer }}
      ref={ref}
    >
      <div className="tile-areas">
        {tileGroup.areas.map((a, i) => (
          <TileArea area={a} key={i} dragBind={dragBind} />
        ))}
      </div>
      <div className="children" {...dragBind()}>
        {children}
      </div>
    </div>
  );
}
