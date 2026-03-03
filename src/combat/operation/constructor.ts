// src/combat/operation/constructor.ts

import { OperationContext } from './types.ts';
import { CombatState } from '../state';
import { DeclaredAction } from '../turn';

export function buildOperationContext (
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
