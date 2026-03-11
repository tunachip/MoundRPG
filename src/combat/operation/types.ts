// src/combat/operation/types.ts

import type { CombatStateManager } from '../state/index.ts';
import type { DamageElement, Status, EventTrigger, OpCode } from '../../shared/types.ts';
import type { EmitterEvent } from '../emitter/types.ts';
import type { Condition } from '../condition/types.ts';
import type { Actor } from '../../actor/types.ts';

export interface Operation {
	name: OpCode;
	args: Record<string, unknown>;
}

export interface DamageResult {
	damage: number;
	absorb: number;
	blockedBy: Array<DamageElement>;
}

export interface OperationContext {
	combat: CombatStateManager;
	caster: Actor;
	targets: Array<Actor>;
	trigger?: EventTrigger;
	element?: DamageElement;
	status?: Status;
	amount?: number;
	baseDamage?: number;
	calculatedDamage?: DamageResult;
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
