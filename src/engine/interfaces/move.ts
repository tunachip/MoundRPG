// src/engine/interfaces/move.ts

import { MoveType, MoveSpeed, GameElement } from '../types.ts';
import { OperationMatrix } from './operation.ts';
import { FragmentData } from './fragment.ts';

export interface MoveData {
	templateId: number;
	fragments: Array<FragmentData>;
	maxFragments: number;
}

export interface CombatMove {
	name: string;
	isActive: boolean;
	moveType: MoveType;
	moveSpeed: MoveSpeed;
	element: GameElement;
	isBound: boolean;
	canChain: boolean;
	canBeChainedInto: boolean;
	operations:	OperationMatrix;
	cooldownTurns: number;
}

