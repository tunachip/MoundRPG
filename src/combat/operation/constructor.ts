// src/combat/operation/constructor.ts

import type { OperationContext } from './types.ts';
import type { CombatState } from '../state/index.ts';
import type { DeclaredAction } from '../turn/index.ts';

export function createOperationContext (
	combat: CombatState,
	action: DeclaredAction,
): OperationContext {
	const element =
		action.move?.type === 'move'
		? combat.moves[action.move.index]?.element
		: undefined;

	return {
		combat,
		caster: action.caster,
		targets: action.targets,
		element,
	};
}
