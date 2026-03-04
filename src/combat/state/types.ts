// src/combat/state/types.ts

import { CombatEntity, CombatMove, CombatBlessing, Listener } from './actor/index.ts';

export interface CombatState {
	turn: number;
	entities: Array<CombatEntity>;
	moves: Array<CombatMove>;
	blessings: Array<CombatBlessing>;
	listeners: Array<Listener>;
}
