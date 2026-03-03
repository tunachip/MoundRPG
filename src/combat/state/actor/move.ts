// src/combat/state/actor/move.ts

import { DamageElement, MoveType } from '../../../shared';
import { OperationMatrix } from '../../operation';

export interface CombatMove {
	name: string;
	ownerIndex: number;
	isActive: boolean;
	type: MoveType;
	element: DamageElement;
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
