import * as React from 'react';
import { Observer } from 'mobx-react-lite';

import { useStore } from '../context';

import Slot from '../Slot';

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
              c = (
                <div>
                  <h4>{selected.nodeType.name}</h4>

                  <div className="flex mt-3">
                    <div className="flex-grow">
                      <Observer>
                        {() => (
                          <>
                            {selected.storageSlots.map((slot, i) => (
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
                            {selected.outSlots.map((slot, i) => (
                              <Slot key={i} slot={slot} />
                            ))}
                          </>
                        )}
                      </Observer>
                    </div>
                  </div>
                </div>
              );
              break;

            case 'Storage':
              c = (
                <div>
                  <h4>{selected.storageType.name}</h4>

                  <div className="flex mt-3 flex-wrap">
                    <Observer>
                      {() => (
                        <>
                          {selected.slots.map((slot, i) => (
                            <Slot key={i} slot={slot} />
                          ))}
                        </>
                      )}
                    </Observer>
                  </div>
                </div>
              );
              break;

            default:
              break;
          }

          return (
            <div className="status-explainer" style={{ transform: 'translate(0, -100%)' }}>
              {c}
            </div>
          );
        }

        return <></>;
      }}
    </Observer>
  );
}
