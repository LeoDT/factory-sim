import * as React from 'react';
import { render } from 'react-dom';

import { loadResourceTypes } from './core/resource';
import { loadNodeTypes } from './core/node';
import { loadStorageTypes } from './core/storage';

import { mock } from './game/store';
import Game from './game/Game';

loadResourceTypes();
loadNodeTypes();
loadStorageTypes();

function renderGame() {
  mock();
  render(<Game />, document.getElementById('game'));
}

renderGame();

module.hot.accept();
