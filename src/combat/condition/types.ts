// src/combat/condition/types.ts

import type { CombatState } from '../state/types.ts';

export interface Condition {
	name: string;
	args: ConditionContext;
	expects: any;
}

interface ConditionContext {
	combat: CombatState;
}
