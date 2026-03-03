// src/engine/interfaces/move.ts

import { MoveType, MoveSpeed, GameElement } from '../types.ts';
import { CombatEntity } from './entity.ts';
import { OperationMatrix } from './operation.ts';
import { FragmentData } from './fragment.ts';

export interface MoveData {
	templateId:		number;
	maxFragments: number;
	fragments:		Array<FragmentData>;
}

export interface CombatMove {
	name:														string;
	ownerIndex:											number;
	isActive:												boolean;
	moveType:												MoveType;
	moveSpeed:											MoveSpeed;
	element:												GameElement;
	isBound:												boolean;
	isHidden:												boolean;
	canChain:												boolean;
	canBeChainedInto:								boolean;
	operations:											OperationMatrix;
	cooldownTurns:									number;
	whileActiveListenerIndexes:			Array<number>;
	whileBankedListenerIndexes:			Array<number>;
	whileOnCooldownListenerIndexes: Array<number>;
}

