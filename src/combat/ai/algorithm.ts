// src/combat/ai/algorithm.ts

import type { Actor } from '../../actor/types.ts';
import type { TemperamentTag } from '../../content/encounters/types.ts';
import type { CombatState, CombatEntity, CombatMove } from '../state/index.ts';
import type { DeclaredAction } from '../turn/index.ts';
import type { CombatAiProfile } from './types.ts';
import { expandDynamicPriorities, priorityWeight, scoreAttackPressure, scoreByTemperament, } from './rules.ts';

function getValidTargets (
	combat: CombatState,
	casterIndex: number,
): Array<Actor> {
	return combat.entities
		.filter((entity) => entity.index !== casterIndex)
		.filter((entity) => entity.hp > 0)
		.map((entity) => ({ type: 'entity', index: entity.index } as Actor));
}

export function createAiActions (
	combat: CombatState,
	casterIndex: number,
	profile: CombatAiProfile,
): Array<DeclaredAction> {
	const caster = combat.entities[casterIndex];
	if (!caster || caster.hp <= 0) { return []; }

	const enemyTargets = getValidTargets(combat, casterIndex);
	if (enemyTargets.length === 0) { return []; }

	const simulatedActiveMoves = new Set<number>(
		caster.moves.filter((moveIndex) =>
		combat.moves[moveIndex]?.isActive));
	const maxActions = Math.max(
		1,
		Math.min(
			maxActionsForEnergy(caster.energy),
			resolveMaxChainActions(profile, combat, caster),
		),
	);

	const actions: Array<DeclaredAction> = [];
	const chainMoveHistory: Array<number> = [];

	for (let chainIndex = 0; chainIndex < maxActions; chainIndex += 1) {
		const disallowed = disallowedChainMoves(chainMoveHistory);
		const availableMoveIndexes = caster.moves
			.filter((moveIndex) => combat.moves[moveIndex]?.cooldownTurns === 0)
			.filter((moveIndex) => !combat.moves[moveIndex]?.isBound)
			.filter((moveIndex) => !disallowed.has(moveIndex));
		
		const bankedMoveIndexes = availableMoveIndexes.filter(
			(moveIndex) => !simulatedActiveMoves.has(moveIndex)
		);
		const activeMoveIndexes = availableMoveIndexes.filter(
			(moveIndex) => simulatedActiveMoves.has(moveIndex)
		);

		if (activeMoveIndexes.length === 0 && bankedMoveIndexes.length > 0) {
			const moveIndex = pickMoveIndexByTemperament(
				combat,
				caster,
				enemyTargets,
				bankedMoveIndexes,
				profile,
				'activate',
				chainIndex,
			);
			simulatedActiveMoves.add(moveIndex);
			actions.push({
				type: 'activateMove',
				caster: { type: 'entity', index: casterIndex },
				move: { type: 'move', index: moveIndex },
				targets: [],
				chainIndex,
			});
			chainMoveHistory.push(moveIndex);
			continue;
		}

		if (activeMoveIndexes.length > 0) {
			const moveIndex = pickMoveIndexByTemperament(
				combat,
				caster,
				enemyTargets,
				activeMoveIndexes,
				profile,
				'cast',
				chainIndex,
			);
			const targets = pickTargetsByTemperament(
				combat,
				caster,
				enemyTargets,
				combat.moves[moveIndex],
				profile
			);
			
			actions.push({
				type: 'castMove',
				caster: { type: 'entity', index: casterIndex },
				move: { type: 'move', index: moveIndex },
				targets,
				chainIndex,
			});
			chainMoveHistory.push(moveIndex);
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

function disallowedChainMoves (
	chainMoveHistory: Array<number>,
): Set<number> {
	const disallowed = new Set<number>();
	const last = chainMoveHistory[chainMoveHistory.length - 1];
	if (last !== undefined) {
		disallowed.add(last);
	}
	const prior = chainMoveHistory[chainMoveHistory.length - 2];
	if (prior !== undefined) {
		disallowed.add(prior);
	}
	return disallowed;
}

export function createAiProfile (
	priorities: Array<TemperamentTag>,
): CombatAiProfile {
	return {
		priorities,
		maxChainActions: resolveMaxChainActions({
			priorities,
		}),
	};
}

function resolveMaxChainActions (
	profile: CombatAiProfile,
	combat?: CombatState,
	caster?: CombatEntity,
): number {
	if (profile.maxChainActions !== undefined) {
		return profile.maxChainActions;
	}
	let chainCap = 2;
	const priorities = profile.priorities;
	if (priorities.includes('spendthrift')) {
		chainCap += 2;
	}
	if (priorities.includes('multi-tasker')) {
		chainCap = Math.max(chainCap, 3);
	}
	if (priorities.includes('frugal')) {
		chainCap = Math.min(chainCap, 2);
	}
	if (priorities.includes('explosive') && caster && caster.energy >= 3) {
		chainCap += 1;
	}
	if (priorities.includes('earlybird') && combat) {
		chainCap += combat.turn < 3 ? 1 : -1;
	}
	return Math.max(1, Math.min(chainCap, 6));
}

function maxActionsForEnergy (
	energy: number,
): number {
	return Math.floor((1 + Math.sqrt(1 + (8 * energy))) / 2);
}

function pickMoveIndexByTemperament (
	combat: CombatState,
	caster: CombatEntity,
	enemyTargets: Array<Actor>,
	moveIndexes: Array<number>,
	profile: CombatAiProfile,
	intent: 'activate' | 'cast',
	chainIndex: number,
): number {
	let bestMoveIndex = moveIndexes[0];
	let bestScore = Number.NEGATIVE_INFINITY;

	for (const moveIndex of moveIndexes) {
		const move = combat.moves[moveIndex];
		const score = scoreMoveByPriorities(
			combat,
			caster,
			enemyTargets,
			move, 
			profile,
			intent,
			chainIndex
		);
		if (score > bestScore) {
			bestScore = score;
			bestMoveIndex = moveIndex;
			continue;
		}
		if (score === bestScore && Math.random() < 0.5) {
			bestMoveIndex = moveIndex;
		}
	}
	return bestMoveIndex;
}

function scoreMoveByPriorities (
	combat: CombatState,
	caster: CombatEntity,
	enemyTargets: Array<Actor>,
	move: CombatMove,
	profile: CombatAiProfile,
	intent: 'activate' | 'cast',
	chainIndex: number,
): number {
	let score = intent === 'cast' ? 0.2 : 0;
	const priorities = expandDynamicPriorities(
		profile.priorities,
		combat,
		caster
	);

	for (let index = 0; index < priorities.length; index += 1) {
		const temperament = priorities[index];
		const weight = priorityWeight(index);
		score += weight * scoreByTemperament(temperament, {
			combat,
			caster,
			enemyTargets,
			move,
			intent,
			chainIndex,
		});
	}
	return score;
}

function pickTargetsByTemperament (
	combat: CombatState,
	caster: CombatEntity,
	enemyTargets: Array<Actor>,
	move: CombatMove,
	profile: CombatAiProfile,
): Array<Actor> {
	if (enemyTargets.length <= 1) {
		return enemyTargets;
	}
	const priorities = expandDynamicPriorities(
		profile.priorities,
		combat,
		caster
	);

	if (priorities.includes('aggressive') ||
			priorities.includes('offensive')) {
		return [...enemyTargets].sort((left, right) =>
				combat.entities[left.index].hp
			- combat.entities[right.index].hp
		).slice(0, 1);
	}
	if (priorities.includes('tactical')) {
		return [...enemyTargets].sort((left, right) =>
			  scoreAttackPressure(combat, [right], move.element)
			- scoreAttackPressure(combat, [left], move.element)
		).slice(0, 1);
	}
	return [enemyTargets[0]];
}

