// src/engine/template/move.ts

import { GameElement, MoveType, MoveSpeed } from '../types.ts';
import { OperationMatrix } from '../interfaces/operation.ts';

// TEMPLATE FOR MOVE COMPILER

export interface MoveTemplate {
	name:							string;
	devNotes:					string;
	moveType:					MoveType;
	moveSpeed:				MoveSpeed;
	element:					GameElement;
	baseDamage:				number;
	baseIterations:		number;
	canChain:					boolean;
	canBeChainedInto: boolean;
	operations:				OperationMatrix;
}

