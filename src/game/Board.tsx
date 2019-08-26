import './Board.scss';

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
          className="board-tile-group"
          tileGroup={board.tileGroup}
          onDragStart={e => {
            if (e) {
              store.ui.select(board, e.currentTarget);
            }
          }}
          onDragSuccess={() => {
            store.checkBoardWrapThings(board);
          }}
          highlight={store.ui.selected.get() === board}
        />
      )}
    </Observer>
  );
}
