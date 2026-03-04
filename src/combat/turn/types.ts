// src/combat/turn/types.ts

import type { Actor } from '../../actor/types.ts';
import type { ActionType } from '../../shared/types.ts';

export interface DeclaredAction {
	type: ActionType;
	move?: Actor;
	caster: Actor;
	targets: Array<Actor>;
	chainIndex: number;
}
