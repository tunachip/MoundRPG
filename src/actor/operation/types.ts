// src/actor/operation/types.ts

import { CombatState } from '../../combat/state';
import { DamageElement, Status, ActorType } from '../../shared';

export interface Operation {
	name: string;
	args: OperationContext;
}

interface Actor {
	type: ActorType;
	index: number;
}

export interface OperationContext {
	combat: CombatState;
	caster: Actor;
	targets: Array<Actor>;
	element?: DamageElement;
	status?: Status;
	amount?: number;
	baseDamage?: number;
	calculatedDamage?: number;
}

