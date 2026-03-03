// src/combat/state/types/entity.ts

import { DamageElement, Status, EntityType } from '../../../shared';

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
}

interface DamageHistory {
	max: number;
	last: number;
	total: number;
}
