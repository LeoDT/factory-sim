import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { useStore } from '../context';

export default function Explainer(): JSX.Element {
  const { ui } = useStore();

  return (
    <Observer>
      {() => {
        const selected = ui.selected.get();

        if (selected) {
          let c;

          switch (selected._type) {
            case 'Node':
              c = <div>{selected.nodeType.name}</div>;
              break;

            case 'Storage':
              c = <div>{selected.storageType.name}</div>;
              break;

            default:
              break;
          }

          return (
            <div
              className="p-3 absolute top-0 right-0 bg-green-100"
              style={{ transform: 'translate(0, -100%)' }}
            >
              {c}
            </div>
          );
        }

        return <></>;
      }}
    </Observer>
  );
}
