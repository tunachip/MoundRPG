// src/actor/operation/types.ts

import { CombatState } from '../../combat/state';
import { DamageElement, Status } from '../../shared';
import { Actor } from '../';

export interface Operation {
	name: string;
	args: OperationContext;
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

