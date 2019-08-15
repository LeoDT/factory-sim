import { TileScene } from '~core/tile';
import { createContextNoNullCheck } from '~utils/react';

import { Store } from './store';

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();

export const [useTileScene, TileSceneContext] = createContextNoNullCheck<TileScene>();
