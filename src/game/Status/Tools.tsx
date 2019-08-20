import * as React from 'react';

import { nodeTypes } from '~core/node';
import { storageTypes } from '~core/storage';
import { useStore } from '~game/context';

function ToolButton(props: {
  children: React.ReactNode;
  onClick: React.MouseEventHandler;
}): JSX.Element {
  return (
    <div
      className="bg-white text-blue-700 py-1 px-2 border border-blue-500 rounded mr-2 cursor-pointer hover:bg-gray-100"
      {...props}
    />
  );
}

export default function Tools(): JSX.Element {
  const store = useStore();
  const nodes: JSX.Element[] = [];
  const storages: JSX.Element[] = [];

  nodeTypes.forEach(t => {
    nodes.push(
      <ToolButton key={t.id} onClick={() => store.addNode(t)}>
        {t.name}
      </ToolButton>
    );
  });

  storageTypes.forEach(t => {
    storages.push(
      <ToolButton key={t.id} onClick={() => store.addStorage(t)}>
        {t.name}
      </ToolButton>
    );
  });

  return (
    <div className="px-2 h-full flex items-center">
      {nodes}
      {storages}
    </div>
  );
}
