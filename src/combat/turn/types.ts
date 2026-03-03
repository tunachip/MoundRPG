// src/combat/turn/types.ts

import { Actor } from '../../actor';
import { ActionType } from '../../shared';

export interface DeclaredAction {
	type: ActionType;
	move?: Actor;
	caster: Actor;
	targets: Array<Actor>;
	chainIndex: number;
}

