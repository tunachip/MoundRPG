// src/engine/interfaces/combat.ts

import { CombatEntity } from './entity.ts';
import { CombatMove } from './move.ts';
import { CombatBlessing } from './blessing.ts';
import { Listener } from './listener.ts';

export interface CombatState {
	turn: number;
	entities:  Array<CombatEntity>;
	moves:		 Array<CombatMove>;
	blessings: Array<CombatBlessing>;
	listeners: Array<Listener>;
}
