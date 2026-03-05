// src/combat/turn/loop.ts

import type { Actor } from '../../actor/types.ts';
import { DamageElements, Statuses } from '../../shared/constants.ts';
import type { DamageElement, Status } from '../../shared/types.ts';
import type { CombatState, CombatEntity, CombatMove } from '../state/index.ts';
import type { DeclaredAction } from './types.ts';
import type { Operation, OperationContext, OperationResult } from '../operation/types.ts';
import { createOperationContext } from '../operation/constructor.ts';
import { executeOperationByCode } from '../operation/registry.ts';
import { heal } from '../operation/health.ts';
import { tickDamageStatus } from '../operation/tick.ts';
import { reduceStatus } from '../operation/status.ts';
import { reduceCooldown } from '../operation/cooldown.ts';
import { applyEnergy, reduceEnergy } from '../operation/energy.ts';

export interface TurnExecutionResult {
	turn: number;
	order: Array<number>;
}

export function executeCombatTurn (
	combat: CombatState,
	declaredActionsByEntity: Record<number, Array<DeclaredAction>>,
	priorityEntityIndex?: number,
): TurnExecutionResult {
	const activePriority = priorityEntityIndex ?? combat.hasPriority;
	const order = calculateTurnOrder(combat, declaredActionsByEntity, activePriority);

	for (const entityIndex of order) {
		const entity = combat.entities[entityIndex];
		if (!entity || entity.hp <= 0) {
			continue;
		}
		const actions = declaredActionsByEntity[entityIndex] ?? [];
		executeEntityTurn(combat, entityIndex, actions);
	}

	combat.turn += 1;
	combat.hasPriority = findNextLivingEntityIndex(combat, activePriority);
	return {
		turn: combat.turn,
		order,
	};
}

export function calculateTurnOrder (
	combat: CombatState,
	declaredActionsByEntity: Record<number, Array<DeclaredAction>>,
	priorityEntityIndex?: number,
): Array<number> {
	return combat.entities
		.filter((entity) => entity.hp > 0)
		.map((entity) => ({
			index: entity.index,
			speed: calculateEntityTurnSpeed(
				combat,
				entity,
				declaredActionsByEntity[entity.index] ?? [],
				priorityEntityIndex
			),
		}))
		.sort((left, right) => {
			if (left.speed === right.speed) {
				return left.index - right.index;
			}
			return right.speed - left.speed;
		})
		.map((entry) => entry.index);
}

function calculateEntityTurnSpeed (
	combat: CombatState,
	entity: CombatEntity,
	actions: Array<DeclaredAction>,
	priorityEntityIndex?: number,
): number {
	let speed = 0;
	if (priorityEntityIndex === entity.index) {
		speed += 1;
	}
	if (entity.hasStatus.quick) {
		speed += 2;
	}
	if (entity.hasStatus.slow) {
		speed -= 2;
	}

	const firstAction = actions[0];
	if (firstAction?.move?.type === 'move') {
		const move = combat.moves[firstAction.move.index];
		if (move?.speed === 'quick') {
			speed += 2;
		}
		if (move?.speed === 'slow') {
			speed -= 2;
		}
	}
	return speed;
}

function executeEntityTurn (
	combat: CombatState,
	entityIndex: number,
	actions: Array<DeclaredAction>,
): OperationResult {
	const entity = combat.entities[entityIndex];
	const caster: Actor = { type: 'entity', index: entityIndex };
	const counters = auditCounters(combat, entity);
	const turnResult: OperationResult = { breaks: false };

	if (entity.hasStatus.sleep) {
		heal({
			combat,
			caster,
			targets: [caster],
			amount: 1,
		});
	}

	for (const status of DamageTickStatuses) {
		if (!entity.hasStatus[status]) {
			continue;
		}
		const tickResult = tickDamageStatus({
			combat,
			caster,
			targets: [caster],
			status,
		});
		mergeOperationResult(turnResult, tickResult);
		if (entity.hp <= 0 || tickResult.breaks) {
			return turnResult;
		}
	}

	const choicesResult = executeEntityChoices(combat, entityIndex, actions);
	mergeOperationResult(turnResult, choicesResult);
	if (entity.hp <= 0 || choicesResult.breaks) {
		return turnResult;
	}

	resolveCounters(combat, entityIndex, counters);
	applyEnergy({
		combat,
		caster,
		targets: [caster],
		amount: 1,
	});
	return turnResult;
}

interface EntityCounters {
	attunements: Array<DamageElement>;
	statuses: Array<Status>;
	movesOnCooldown: Array<number>;
}

function auditCounters (
	combat: CombatState,
	entity: CombatEntity,
): EntityCounters {
	const attunements = DamageElements.filter((element) => entity.attunedTo[element]);
	const statuses = Statuses.filter((status) => entity.hasStatus[status]);
	const movesOnCooldown = entity.moves.filter((moveIndex) => {
		const move = combat.moves[moveIndex];
		return Boolean(move && move.cooldownTurns > 0);
	});
	return {
		attunements,
		statuses,
		movesOnCooldown,
	};
}

function resolveCounters (
	combat: CombatState,
	entityIndex: number,
	counters: EntityCounters,
): void {
	const entity = combat.entities[entityIndex];
	const caster: Actor = { type: 'entity', index: entityIndex };
	for (const element of counters.attunements) {
		if (entity.attunedTo[element]) {
			entity.turnsAttuned[element] += 1;
		}
	}
	for (const status of counters.statuses) {
		if (entity.hasStatus[status]) {
			reduceStatus({
				combat,
				caster,
				targets: [caster],
				status,
				amount: 1,
			});
		}
	}
	for (const moveIndex of counters.movesOnCooldown) {
		if (combat.moves[moveIndex]?.cooldownTurns > 0) {
			reduceCooldown({
				combat,
				caster,
				targets: [{ type: 'move', index: moveIndex }],
				amount: 1,
			});
		}
	}
}

function executeEntityChoices (
	combat: CombatState,
	entityIndex: number,
	actions: Array<DeclaredAction>,
): OperationResult {
	const result: OperationResult = { breaks: false };
	const entity = combat.entities[entityIndex];
	let lastMoveElement: DamageElement | '' = '';

	for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
		if (entity.hp <= 0) {
			result.breaks = true;
			break;
		}

		const action = actions[actionIndex];
		if (action.caster.type !== 'entity' || action.caster.index !== entityIndex) {
			continue;
		}

		if (action.type === 'focus') {
			if (action.chainIndex !== 0 || actionIndex !== 0) {
				continue;
			}
			const focusResult = applyEnergy({
				combat,
				caster: action.caster,
				targets: [action.caster],
				amount: 1,
			});
			mergeOperationResult(result, focusResult);
			break;
		}

		if (action.move?.type !== 'move') {
			continue;
		}
		const move = combat.moves[action.move.index];
		if (!move) {
			continue;
		}
		if (moveDisqualified(entity, move)) {
			continue;
		}

		const energyCost = applyElementTax(lastMoveElement, move.element, action.chainIndex);
		if (entity.energy < energyCost) {
			continue;
		}
		const payResult = reduceEnergy({
			combat,
			caster: action.caster,
			targets: [action.caster],
			amount: energyCost,
		});
		mergeOperationResult(result, payResult);

		let actionResult: OperationResult = { breaks: false };
		if (move.cooldownTurns > 0) {
			actionResult = executeOperationMatrix(combat, action, move.operations.fromOnCooldown);
		} else if (action.type === 'activateMove') {
			move.isActive = true;
			actionResult = executeOperationMatrix(combat, action, move.operations.fromBanked);
		} else if (action.type === 'castMove') {
			actionResult = executeOperationMatrix(combat, action, move.operations.fromActive);
		}
		mergeOperationResult(result, actionResult);
		lastMoveElement = move.element;
		if (actionResult.breaks) {
			break;
		}
	}

	return result;
}

function executeOperationMatrix (
	combat: CombatState,
	action: DeclaredAction,
	operations: Array<Operation>,
): OperationResult {
	const result: OperationResult = { breaks: false };
	for (const operation of operations) {
		const ctx = createExecutionContext(combat, action, operation);
		const operationResult = executeOperationByCode(operation.name, ctx);
		mergeOperationResult(result, operationResult);
		if (operationResult.breaks) {
			result.breaks = true;
			break;
		}
	}
	return result;
}

function createExecutionContext (
	combat: CombatState,
	action: DeclaredAction,
	operation: Operation,
): OperationContext {
	const base = createOperationContext(combat, action);
	const args = operation.args;
	const targetType = asString(args.targetType);
	const target = asString(args.target);
	const targetCountRange = asTargetRange(args.targetCountRange);

	let resolvedTargets = resolveTargets(action, target);
	if (targetType) {
		resolvedTargets = resolvedTargets.filter((actor) => actor.type === targetType);
	}
	if (targetCountRange) {
		resolvedTargets = resolvedTargets.slice(0, targetCountRange.max);
		if (resolvedTargets.length < targetCountRange.min) {
			resolvedTargets = [];
		}
	}

	return {
		...base,
		targets: resolvedTargets,
		element: asDamageElement(args.element) ?? base.element,
		status: asStatus(args.status),
		amount: asNumber(args.amount),
		baseDamage: asNumber(args.baseDamage),
	};
}

function resolveTargets (
	action: DeclaredAction,
	target: string | undefined,
): Array<Actor> {
	switch (target) {
		case 'caster':
			return [action.caster];
		case 'self':
			return action.move ? [action.move] : [];
		case 'random':
			return action.targets.length > 0 ? [action.targets[0]] : [];
		case 'chosen':
		default:
			return [...action.targets];
	}
}

function moveDisqualified (
	entity: CombatEntity,
	move: CombatMove,
): boolean {
	switch (true) {
		case move.isBound:
			return true;
		case entity.hasStatus.sleep:
			return true;
		case move.type === 'attack' && entity.hasStatus.stun:
			return true;
		case move.type === 'utility' && entity.hasStatus.anger:
			return true;
		default:
			return false;
	}
}

function applyElementTax (
	lastElement: DamageElement | '',
	nextElement: DamageElement,
	energyCost: number,
): number {
	if (lastElement === '') {
		return energyCost;
	}
	if (nextElement === 'vital' || lastElement === 'vital') {
		return energyCost;
	}
	if (lastElement === nextElement) {
		return energyCost;
	}
	const lastIndex = elementIndex(lastElement);
	const nextIndex = elementIndex(nextElement);
	if (Math.abs(lastIndex - nextIndex) <= 1) {
		return energyCost;
	}
	return energyCost + 1;
}

function elementIndex (
	element: Exclude<DamageElement, 'vital'>,
): number {
	switch (element) {
		case 'water':
			return 0;
		case 'stone':
			return 1;
		case 'fire':
			return 2;
		case 'plant':
			return 3;
		case 'force':
			return 4;
		case 'thunder':
			return 5;
	}
}

function asString (value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

function asNumber (value: unknown): number | undefined {
	return typeof value === 'number' ? value : undefined;
}

function asStatus (value: unknown): Status | undefined {
	return typeof value === 'string' ? value as Status : undefined;
}

function asDamageElement (value: unknown): DamageElement | undefined {
	return typeof value === 'string' ? value as DamageElement : undefined;
}

function asTargetRange (
	value: unknown,
): { min: number; max: number } | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const range = value as { min?: unknown; max?: unknown };
	if (typeof range.min !== 'number' || typeof range.max !== 'number') {
		return undefined;
	}
	return { min: range.min, max: range.max };
}

function mergeOperationResult (
	target: OperationResult,
	incoming: OperationResult,
): void {
	if (incoming.breaks) {
		target.breaks = true;
	}
	if (incoming.triggers && incoming.triggers.length > 0) {
		target.triggers ??= [];
		target.triggers.push(...incoming.triggers);
	}
	if (incoming.changes && incoming.changes.length > 0) {
		target.changes ??= [];
		target.changes.push(...incoming.changes);
	}
}

const DamageTickStatuses: Array<Status> = ['burn', 'decay', 'wound'];

function findNextLivingEntityIndex (
	combat: CombatState,
	currentIndex: number,
): number {
	const total = combat.entities.length;
	if (total === 0) {
		return 0;
	}
	for (let offset = 1; offset <= total; offset += 1) {
		const candidate = (currentIndex + offset) % total;
		if (combat.entities[candidate]?.hp > 0) {
			return candidate;
		}
	}
	return currentIndex;
}
