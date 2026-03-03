// src/combat/condition/types.ts

import { CombatState } from '../state';

export interface Condition {
	name: string;
	args: ConditionContext;
	expects: any;
}

interface ConditionContext {
	combat: CombatState;
}
