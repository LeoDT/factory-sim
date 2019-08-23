import 'normalize.css';

import * as React from 'react';
import { render } from 'react-dom';

import { loadResourceTypes } from './core/resource';
import { loadNodeTypes } from './core/node';
import { loadStorageTypes } from './core/storage';
import { loadBoardTypes } from '~core/board';

import Game from './game/Game';

loadResourceTypes();
loadNodeTypes();
loadBoardTypes();
loadStorageTypes();

function renderGame(): void {
  render(<Game />, document.getElementById('game'));
}

renderGame();

module.hot.accept();
