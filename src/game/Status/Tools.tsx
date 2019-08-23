import * as React from 'react';

import { nodeTypes } from '~core/node';
import { useStore } from '~game/context';
import { boardTypes } from '~core/board';
import { pauseRunClock, resumeRunClock } from '~core/clocks';

export default function Tools(): JSX.Element {
  const store = useStore();
  const [paused, setPaused] = React.useState(false);
  const buttons: JSX.Element[] = [];

  nodeTypes.forEach(t => {
    buttons.push(
      <div className="button" key={`node-${t.id}`} onClick={() => store.addNode(t)}>
        {t.name}
      </div>
    );
  });

  boardTypes.forEach(t => {
    buttons.push(
      <div className="button" key={`board-${t.id}`} onClick={() => store.addBoard(t)}>
        {t.name}
      </div>
    );
  });

  return (
    <div className="status-tools">
      {buttons}
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
