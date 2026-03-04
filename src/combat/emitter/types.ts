// src/combat/emitter/types.ts

import { Actor } from '../../actor';
import { EventTrigger } from '../../shared';


export interface EmitterEvent {
	trigger: EventTrigger;
	actors?: Array<Actor>;
}
