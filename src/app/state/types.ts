// src/app/state/types.ts

import type { AppState } from '../../shared/types.ts';
import type { Entity } from '../../actor/entity/types.ts';

export interface AppContext {
	player?: Entity;
	encounter?: Entity;
}

export interface AppStateManager {
	state: AppState;
	ctx: AppContext;
}
