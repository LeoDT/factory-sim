import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { Node } from '~node';
import Slot from './Slot';

interface Props {
  node: Node;
}

export default function Node({ node }: Props) {
  return (
    <div className="p-3 border border-indigo-200	bg-white rounded m-3">
      <h4 className="text-xl">{node.nodeType.name}</h4>
      <div className="flex mt-3">
        <div className="flex-grow">
          <Observer>
            {() => (
              <>
                {node.storage.map((slot, i) => (
                  <Slot key={i} slot={slot} />
                ))}
              </>
            )}
          </Observer>
        </div>
        <div>
          <Observer>
            {() => (
              <>
                {node.outSlots.map((slot, i) => (
                  <Slot key={i} slot={slot} />
                ))}
              </>
            )}
          </Observer>
        </div>
      </div>
    </div>
  );
}
