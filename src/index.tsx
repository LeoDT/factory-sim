import * as React from 'react';
import { render } from 'react-dom';

import { loadResourceTypes } from './resource';
import { loadNodeTypes } from './node';
import { loadStorageTypes } from './storage';
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
