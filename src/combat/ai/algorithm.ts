// src/combat/ai/algorithm.ts

import { Actor } from '../../actor/index.ts';
import { Speed } from '../../shared/types.ts';
import { Temperament } from '../../content/encounters/index.ts';
import { CombatState } from '../state/index.ts';
import { DeclaredAction } from '../turn/index.ts';
import { CombatAiProfile } from './types.ts';

export function createAiActions (
	combat: CombatState,
	casterIndex: number,
	profile: CombatAiProfile
): Array<DeclaredAction> {
	const caster = combat.entities[casterIndex];
	if (!caster || caster.hp <= 0) {
		return [];
	}

	const enemyTargets = combat.entities
		.filter((entity) => entity.index !== casterIndex)
		.filter((entity) => entity.hp > 0)
		.map((entity) => ({ type: 'entity', index: entity.index } as Actor));
	if (enemyTargets.length === 0) {
		return [];
	}

	const simulatedActiveMoves = new Set<number>(
		caster.moves.filter((moveIndex) => combat.moves[moveIndex]?.isActive)
	);
	const maxActions = Math.max(
		1,
		Math.min(
			maxActionsForEnergy(caster.energy),
			resolveMaxChainActions(profile)
		),
	);
	const actions: Array<DeclaredAction> = [];

	for (let chainIndex = 0; chainIndex < maxActions; chainIndex += 1) {
		const availableMoveIndexes = caster.moves
			.filter((moveIndex) => combat.moves[moveIndex]?.cooldownTurns === 0);
		const bankedMoveIndexes = availableMoveIndexes.filter(
			(moveIndex) => !simulatedActiveMoves.has(moveIndex) && !combat.moves[moveIndex].isBound
		);
		const activeMoveIndexes = availableMoveIndexes.filter(
			(moveIndex) => simulatedActiveMoves.has(moveIndex)
		);

		if (activeMoveIndexes.length === 0 && bankedMoveIndexes.length > 0) {
			const moveIndex = pickMoveIndexByTemperament(combat, bankedMoveIndexes, profile, 'activate');
			simulatedActiveMoves.add(moveIndex);
			actions.push({
				type: 'activateMove',
				caster: { type: 'entity', index: casterIndex },
				move: { type: 'move', index: moveIndex },
				targets: [],
				chainIndex,
			});
			continue;
		}

		if (activeMoveIndexes.length > 0) {
			const moveIndex = pickMoveIndexByTemperament(combat, activeMoveIndexes, profile, 'cast');
			actions.push({
				type: 'castMove',
				caster: { type: 'entity', index: casterIndex },
				move: { type: 'move', index: moveIndex },
				targets: [enemyTargets[0]],
				chainIndex,
			});
			continue;
		}

		actions.push({
			type: 'focus',
			caster: { type: 'entity', index: casterIndex },
			targets: [],
			chainIndex,
		});
		break;
	}

	return actions;
}

export function createAiProfile (
	temperament: Temperament,
): CombatAiProfile {
	return {
		temperament,
		maxChainActions: resolveMaxChainActions({
			temperament,
		}),
	};
}

function resolveMaxChainActions (
	profile: CombatAiProfile,
): number {
	if (profile.maxChainActions !== undefined) {
		return profile.maxChainActions;
	}

	switch (profile.temperament) {
		case 'timid':
			return 1;
		case 'normal':
			return 2;
		case 'tactical':
			return 3;
		case 'aggressive':
			return 4;
	}
}

function maxActionsForEnergy (
	energy: number
): number {
	return Math.floor((1 + Math.sqrt(1 + (8 * energy))) / 2);
}

function pickMoveByTemperament (
	moves: Array<number>,
	combat: CombatState,
	profile: CombatAiProfile,
	intent: 'activate' | 'cast'
): number {
	if (moves.length === 1) {
		return moves[0];
	}

	if (intent === 'cast') {
		if (profile.temperament === 'aggressive') {
			return moves.find((moveIndex) => combat.moves[moveIndex].type === 'attack') ?? moves[0];
		}
		if (profile.temperament === 'timid') {
			return moves.find((moveIndex) => combat.moves[moveIndex].type === 'utility') ?? moves[0];
		}
	}

	if (profile.temperament === 'tactical') {
		return [...moves].sort(
			(left, right) => speedValue(combat.moves[right].speed) - speedValue(combat.moves[left].speed)
		)[0];
	}

	return moves[0];
}

function speedValue (
	speed: Speed
): number {
	switch (speed) {
		case 'quick':
			return 3;
		case 'normal':
			return 2;
		case 'slow':
			return 1;
		default:
			return 0;
	}
}

function pickMoveIndexByTemperament (
	combat: CombatState,
	moveIndexes: Array<number>,
	profile: CombatAiProfile,
	intent: 'activate' | 'cast',
): number {
	return pickMoveByTemperament(moveIndexes, combat, profile, intent);
}
