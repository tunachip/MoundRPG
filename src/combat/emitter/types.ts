// src/combat/emitter/types.ts

import type { Actor } from '../../actor/types.ts';
import type { EventTrigger } from '../../shared/types.ts';


export interface EmitterEvent {
	trigger: EventTrigger;
	actors?: Array<Actor>;
}
