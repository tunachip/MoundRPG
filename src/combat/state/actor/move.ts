// src/combat/state/actor/move.ts

import { DamageElement, MoveType, Speed } from '../../../shared/index.ts';
import { OperationMatrix } from '../../operation/index.ts';

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
