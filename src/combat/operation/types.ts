// src/combat/operation/types.ts

import { CombatState } from '../state';
import { DamageElement, Status, EventTrigger } from '../../shared';
import { EmitterEvent } from '../emitter';
import { Condition } from '../condition';
import { Actor } from '../../actor';

export interface Operation {
	name: string;
	args: OperationContext;
}

export interface OperationContext {
	combat: CombatState;
	caster: Actor;
	targets: Array<Actor>;
	trigger?: EventTrigger;
	element?: DamageElement;
	status?: Status;
	amount?: number;
	baseDamage?: number;
	calculatedDamage?: number;
}

interface Change {
	field: string;
	before: any;
	after: any;
}

export interface OperationResult {
	breaks: boolean;
	triggers?: Array<EmitterEvent>;
	changes?: Array<Change>;
}

export interface OperationMatrix {
	fromActive: Array<Operation>;
	fromBanked: Array<Operation>;
	fromOnCooldown: Array<Operation>;
}

export interface ConditionalOperations {
	conditions: Array<Condition>;
	operations: Array<Operation>;
}

