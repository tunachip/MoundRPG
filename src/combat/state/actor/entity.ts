// src/combat/state/types/entity.ts

import { DamageElement, Status, EntityType } from '../../../shared/index.ts';

export interface CombatEntity {
	name: string;
	type: EntityType;
	hp: number;
	maxHp: number;
	energy: number;
	maxEnergy: number;
	curseRisk: number;
	attunedTo: Record<DamageElement, boolean>;
	turnsAttuned: Record<DamageElement, number>;
	hasStatus: Record<Status, boolean>;
	statusTurns: Record<Status, number>;
	maxStatusTurns: Record<Status, number>;
	immuneToStatus: Record<Status, boolean>;
	damageTaken: DamageHistory;
	index: number;
	moves: Array<number>;
	blessings: Array<number>;
}

interface DamageHistory {
	max: number;
	last: number;
	total: number;
}
