import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { Node } from '~core/node';

import Port from './Port';
import Tile from './Tile';
import { useStore } from './context';

interface Props {
  node: Node;
}

export default function Node({ node }: Props): JSX.Element {
  const { ui } = useStore();

  return (
    <Observer>
      {() => (
        <Tile
          tileGroup={node.tileGroup}
          onDragStart={e => {
            if (e) {
              ui.select(node, e.currentTarget as Element);
            }
          }}
          highlight={ui.selected.get() === node}
        >
          <div>
            <h4 className="text-xl hidden">{node.nodeType.name}</h4>
            <div className="flex justify-between">
              <Port port={node.inPort} type="in" />
              <Port port={node.outPort} type="out" />
            </div>
          </div>
        </Tile>
      )}
    </Observer>
  );
}
