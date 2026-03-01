// src/engine/interfaces/operation.ts

import { Ctx, Status, GameElement } from '../types.ts';
import { CombatEntity } from './entity.ts';
import { CombatMove } from './move.ts';
import { CombatBlessing } from './blessing.ts';
import { ConditionalOperations } from './condition.ts';

export interface Operation {
	name: string;
	args: Object;
}

export interface OperationMatrix {
	fromActive?:			Array<Operation>;
	fromBanked?:			Array<Operation>;
	fromOnCooldown?:	Array<Operation>;
	whileActive?:			ConditionalOperations;
	whileBanked?:			ConditionalOperations;
	whileOnCooldown?: ConditionalOperations;
}

export interface OperationContext {
	caster:						 CombatEntity;
	element:					 GameElement;
	targetEntity?:		 CombatEntity;
	targetMove?:			 CombatMove;
	targetBlessing?:	 CombatBlessing;
	baseDamage?:			 number;
	calculatedDamage?: number;
	status?:					 Status;
	turns?:						 number;
	amount?:					 number;
	absorbs?:					 number;
	heals?:						 number;
	blocked?:					 boolean;
}

export interface OperationResult {
	breaks: boolean;
	ctx?:		Ctx;
}
