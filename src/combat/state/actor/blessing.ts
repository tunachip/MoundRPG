// src/combat/state/actor/blessing.ts

export interface CombatBlessing {
	name: string;
	ownerIndex: number;
	isActive: boolean;
	cooldownTurns: number;
	listenerIndexes: Array<number>;
}
