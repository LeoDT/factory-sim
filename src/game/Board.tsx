import './Board.scss';

import classnames from 'classnames';
import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Board } from '~core/board';

import TileGroup from './Tile/TileGroup';
import { useStore } from './context';

interface Props {
  board: Board;
}

export default function Board({ board }: Props): JSX.Element {
  const store = useStore();

  return (
    <Observer>
      {() => (
        <TileGroup
          className={classnames('board-tile-group', board.boardType.color)}
          tileGroup={board.tileGroup}
          draggable={false}
          highlight={store.ui.selected.get() === board}
          useTileBlock
        />
      )}
    </Observer>
  );
}
