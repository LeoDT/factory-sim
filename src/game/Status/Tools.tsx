import * as React from 'react';

import { nodeTypes, makeNode } from '~core/node';
import { useStore } from '~game/context';
import { boardTypes, makeBoard } from '~core/board';
import { pauseRunClock, resumeRunClock } from '~core/clocks';
import { Observer } from 'mobx-react-lite';

export default function Tools(): JSX.Element {
  const store = useStore();
  const [paused, setPaused] = React.useState(false);
  const buttons: JSX.Element[] = [];

  nodeTypes.forEach(t => {
    buttons.push(
      <div
        className="button"
        key={`node-${t.id}`}
        onClick={e => {
          store.ui.hold(makeNode(t, [0, 0]));
          e.stopPropagation();
        }}
      >
        {t.name}
      </div>
    );
  });

  boardTypes.forEach(t => {
    buttons.push(
      <div
        className="button"
        key={`board-${t.id}`}
        onClick={e => {
          store.ui.hold(makeBoard(t, [0, 0]));
          e.stopPropagation();
        }}
      >
        {t.name}
      </div>
    );
  });

  return (
    <div className="status-tools">
      <Observer>
        {() => {
          if (store.ui.holding.get()) {
            return (
              <div
                className="button cancel"
                onClick={e => {
                  store.ui.unhold();
                  e.stopPropagation();
                }}
              >
                Cancel
              </div>
            );
          }

          return <>{buttons}</>;
        }}
      </Observer>

      <div style={{ marginLeft: 'auto' }}>
        <div
          className="button pause"
          onClick={() => {
            if (paused) {
              resumeRunClock();
              setPaused(false);
            } else {
              pauseRunClock();
              setPaused(true);
            }
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </div>
      </div>
    </div>
  );
}
