// src/combat/state/actor/move.ts

import type { DamageElement, MoveType, Speed } from '../../../shared/types.ts';
import type { OperationMatrix } from '../../operation/types.ts';

export interface CombatMove {
	name: string;
	ownerIndex: number;
	isActive: boolean;
	type: MoveType;
	element: DamageElement;
	speed: Speed;
	isBound: boolean;
	canChain: boolean;
	operations: OperationMatrix;
	cooldownTurns: number;
	listeners: ListenerIndexMatrix;
}

interface ListenerIndexMatrix {
	whileActive: Array<number>;
	whileBanked: Array<number>;
	whileOnCooldown: Array<number>;
}
