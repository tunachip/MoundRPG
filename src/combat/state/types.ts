// src/combat/state/types.ts

import type { CombatEntity, CombatMove, CombatBlessing, Listener } from './actor/index.ts';

export interface CombatState {
	turn: number;
	hasPriority: number;
	entities: Array<CombatEntity>;
	moves: Array<CombatMove>;
	blessings: Array<CombatBlessing>;
	listeners: Array<Listener>;
}
