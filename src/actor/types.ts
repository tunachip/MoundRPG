// src/actor/types.ts

import type { ActorType } from '../shared/types.ts';

export interface Actor {
	type: ActorType;
	index: number;
}
