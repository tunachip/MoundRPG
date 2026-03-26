// src/combat/state/types.ts

import type { CombatEntity, CombatMove, CombatBlessing, Listener } from './actor/index.ts';

export type CombatRow = 'players' | 'encounters';

export interface CombatEntities extends Array<CombatEntity> {
	players: Array<CombatEntity>;
	encounters: Array<CombatEntity>;
}

export interface CombatStateManager {
	turn: number;
	hasPriority: number;
	entities: CombatEntities;
	moves: Array<CombatMove>;
	blessings: Array<CombatBlessing>;
	listeners: Array<Listener>;
}
