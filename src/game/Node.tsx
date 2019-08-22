import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Node } from '~core/node';

import Port from './Port';
import TileGroup from './Tile/TileGroup';
import { useStore } from './context';

interface Props {
  node: Node;
}

export default function Node({ node }: Props): JSX.Element {
  const { ui } = useStore();

  return (
    <Observer>
      {() => (
        <TileGroup
          tileGroup={node.tileGroup}
          onDragStart={e => {
            if (e) {
              ui.select(node, e.currentTarget as Element);
            }
          }}
          highlight={ui.selected.get() === node}
        >
          <div>
            <div className="flex justify-between">
              <Port port={node.inPort} type="in" />
              <Port port={node.outPort} type="out" />
            </div>
          </div>
        </TileGroup>
      )}
    </Observer>
  );
}
