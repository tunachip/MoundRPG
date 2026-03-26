// src/actor/operation/types.ts

import type { CombatStateManager } from '../../combat/state/index.ts';
import type { DamageElement, Status } from '../../shared/types.ts';
import type { Actor } from '../types.ts';

export interface Operation {
	name: string;
	args: OperationContext;
}

export interface OperationContext {
	combat: CombatStateManager;
	caster: Actor;
	targets: Array<Actor>;
	element?: DamageElement;
	status?: Status;
	amount?: number;
	position?: number;
	baseDamage?: number;
	calculatedDamage?: number;
	templateId?: number;
}
