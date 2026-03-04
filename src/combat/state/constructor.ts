// src/combat/state/constructor.ts

import type { CombatState, CombatEntity, CombatBlessing, CombatMove } from './index.ts';
import { createMoveListeners } from './actor/listener.ts';
import type { MoveListenerGroups } from './actor/listener.ts';
import type { Operation, OperationMatrix } from '../operation/types.ts';
import { registerListeners } from '../listener/constructor.ts';
import { DamageElements, Statuses } from '../../shared/constants.ts';
import type { DamageElement, Speed, MoveType } from '../../shared/types.ts';
import type { MoveDefinition, OperationDefinition } from '../../content/moves/index.ts';
import { getMoveDefinition } from '../../content/moves/index.ts';
import type { FragmentDefinition } from '../../content/fragments/index.ts';
import { getFragmentDefinition } from '../../content/fragments/index.ts';
import type { Entity } from '../../actor/entity/types.ts';
import type { Move } from '../../actor/move/types.ts';

interface CombatMoves {
	moves: Array<CombatMove>;
	indexes: Array<number>;
}

interface CombatBlessings {
	blessings: Array<CombatBlessing>;
	indexes: Array<number>;
}

interface MoveMetadata {
	type: MoveType;
	element: DamageElement;
	speed: Speed;
	canChain: boolean;
	baseDamage: number;
	baseIterations: number;
}

const OperationPhases = [
	'fromActive',
	'fromBanked',
	'fromOnCooldown'
] as const;

const TriggeredOperationPhases = [
	'whileActive',
	'whileBanked',
	'whileOnCooldown'
] as const;

export function createCombatState (
	player: Entity,
	encounters: Array<Entity>,
): CombatState {
	const combatState: CombatState = {
		turn: 0,
		entities: [],
		moves: [],
		blessings: [],
		listeners: [],
	};
	const entities = [player, ...encounters];

	for (const entity of entities) {
		const entityIndex = combatState.entities.length;
		const entityMoves = createCombatMoves(combatState, entity, entityIndex);
		const entityBlessings = createCombatBlessings(combatState, entity, entityIndex);
		const combatEntity = createCombatEntity(
			entity,
			entityIndex,
			entityMoves.indexes,
			entityBlessings.indexes
		);
		combatState.entities.push(combatEntity);
	}

	return combatState;
}

function createCombatEntity (
	entity: Entity,
	entityIndex: number,
	moveIndexes: Array<number>,
	blessingIndexes: Array<number>,
): CombatEntity {
	return {
		name:				entity.name,
		type:				entity.type,
		hp:					entity.hp,
		maxHp:			entity.maxHp,
		energy:			entity.energy,
		maxEnergy:	entity.maxEnergy,
		curseRisk:	0,
		attunedTo:			createRecord(DamageElements, false),
		turnsAttuned:		createRecord(DamageElements, 0),
		hasStatus:			createRecord(Statuses, false),
		statusTurns:		createRecord(Statuses, 0),
		maxStatusTurns: createRecord(Statuses, 0),
		immuneToStatus: createRecord(Statuses, false),
		damageTaken: { max: 0, last: 0, total: 0 },
		index:			entityIndex,
		moves:			moveIndexes,
		blessings:	blessingIndexes,
	};
}

function createCombatMoves (
	combatState: CombatState,
	entity: Entity,
	entityIndex: number,
): CombatMoves {
	const combatMoves: Array<CombatMove> = [];
	const indexes: Array<number> = [];

	for (const move of entity.moves) {
		const moveIndex = combatState.moves.length;
		const created = createCombatMove(move, entityIndex, moveIndex);

		const actors = {
			whileActive: [],
			whileBanked: [],
			whileOnCooldown: [],
		};
		for (const phase of TriggeredOperationPhases) {
			actors[phase] = registerListeners(
				combatState,
				created.listeners[phase],
			);
			created.move.listeners[phase] = actors[phase].map((actor) => actor.index);
		}

		combatState.moves.push(created.move);
		combatMoves.push(created.move);
		indexes.push(moveIndex);
	}

	return {
		moves: combatMoves,
		indexes,
	};
}

function createCombatBlessings (
	combatState: CombatState,
	entity: Entity,
	entityIndex: number,
): CombatBlessings {
	const combatBlessings: Array<CombatBlessing> = [];
	const indexes: Array<number> = [];
	for (const blessing of entity.blessings) {
		const blessingIndex = combatState.blessings.length;
		const combatBlessing: CombatBlessing = {
			name: blessing.name,
			ownerIndex: entityIndex,
			isActive: false,
			cooldownTurns: 0,
			listenerIndexes: [],
		};
		combatState.blessings.push(combatBlessing);
		combatBlessings.push(combatBlessing);
		indexes.push(blessingIndex);
	}

	return {
		blessings: combatBlessings, 
		indexes,
	};
}

function createCombatMove (
	move: Move,
	ownerIndex: number,
	moveIndex: number,
): { move: CombatMove; listeners: MoveListenerGroups } {
	const moveDefinition = mergeMoveDefinition(
		getMoveDefinition(move.definitionId),
		move.fragments.map((fragment) => getFragmentDefinition(fragment.definitionId))
	);
	const metadata: MoveMetadata = {
		type: moveDefinition.type,
		element: moveDefinition.element,
		speed: moveDefinition.speed,
		canChain: moveDefinition.canChain,
		baseDamage: moveDefinition.baseDamage,
		baseIterations: moveDefinition.baseIterations,
	};

	const combatMove: CombatMove = {
		name: move.name || moveDefinition.name,
		ownerIndex,
		isActive: false,
		type: metadata.type,
		element: metadata.element,
		speed: metadata.speed,
		isBound: false,
		canChain: metadata.canChain,
		operations: createOperationMatrix(moveDefinition.operations, metadata),
		cooldownTurns: 0,
		listeners: {
			whileActive: [],
			whileBanked: [],
			whileOnCooldown: [],
		},
	};

	return {
		move: combatMove,
		listeners: createMoveListeners({
			moveName: move.name || moveDefinition.name,
			ownerIndex,
			moveIndex,
			operations: moveDefinition.operations,
			createOperation: (operation) => createOperation(operation, metadata),
		}),
	};
}

function mergeMoveDefinition (
	moveDefinition: MoveDefinition,
	fragments: Array<FragmentDefinition>,
): MoveDefinition {
	const merged: MoveDefinition = deepClone(moveDefinition);

	for (const fragment of fragments) {
		applyMetadataUpdates(merged, fragment);
		applyOperationUpdates(merged, fragment);
	}

	return merged;
}

function applyMetadataUpdates (
	moveDefinition: MoveDefinition,
	fragment: FragmentDefinition,
): void {
	const updates = fragment.metadataUpdates;
	if (!updates) {
		return;
	}
	if (updates.element !== undefined) {
		moveDefinition.element = updates.element;
	}
	if (updates.speed !== undefined) {
		moveDefinition.speed = updates.speed;
	}
	if (updates.canChain !== undefined) {
		moveDefinition.canChain = updates.canChain;
	}
	if (updates.damage !== undefined) {
		moveDefinition.baseDamage = updateNumber(moveDefinition.baseDamage, updates.damage);
	}
	if (updates.iterations !== undefined) {
		moveDefinition.baseIterations = updateNumber(moveDefinition.baseIterations, updates.iterations);
	}
}

function applyOperationUpdates (
	moveDefinition: MoveDefinition,
	fragment: FragmentDefinition,
): void {
	const updates = fragment.operationUpdates;
	if (!updates) {
		return;
	}
	for (const phase of OperationPhases) {
		const phaseUpdates = updates[phase];
		if (!phaseUpdates) {
			continue;
		}
		let current = moveDefinition.operations[phase] ?? [];
		for (const update of phaseUpdates) {
			current = mergeOperationArray(current, update.when, update.operations);
		}
		moveDefinition.operations[phase] = current;
	}
	for (const phase of TriggeredOperationPhases) {
		const phaseUpdates = updates[phase];
		if (!phaseUpdates) {
			continue;
		}
		let current = moveDefinition.operations[phase] ?? [];
		for (const update of phaseUpdates) {
			current = mergeOperationArray(current, update.when, update.operations);
		}
		moveDefinition.operations[phase] = current;
	}
}

function createOperationMatrix (
	operations: MoveDefinition['operations'],
	metadata: MoveMetadata,
): OperationMatrix {
	return {
		fromActive: (operations.fromActive ?? []).map((operation) =>
			createOperation(operation, metadata)
		),
		fromBanked: (operations.fromBanked ?? []).map((operation) =>
			createOperation(operation, metadata)
		),
		fromOnCooldown: (operations.fromOnCooldown ?? []).map((operation) =>
			createOperation(operation, metadata)
		),
	};
}

function createOperation (
	operation: OperationDefinition,
	metadata: MoveMetadata,
): Operation {
	const args: Record<string, unknown> = deepClone(operation.args);
	if (args.element === 'meta') {
		args.element = metadata.element;
	}
	if (args.baseDamage === 'meta') {
		args.baseDamage = metadata.baseDamage;
	}
	if (args.baseIterations === 'meta') {
		args.baseIterations = metadata.baseIterations;
	}
	return {
		name: operation.operation,
		args,
	};
}

function updateNumber (
	current: number,
	update: { change: 'add' | 'subtract' | 'multiply' | 'divide' | 'replace'; value: number },
): number {
	switch (update.change) {
		case 'add':
			return current + update.value;
		case 'subtract':
			return current - update.value;
		case 'multiply':
			return current * update.value;
		case 'divide':
			return update.value === 0 ? current : current / update.value;
		case 'replace':
			return update.value;
	}
}

function mergeOperationArray <T> (
	current: Array<T>,
	when: string,
	next: Array<T>,
): Array<T> {
	switch (when) {
		case 'start':
			return [...next, ...current];
		case 'replace':
			return [...next];
		case 'end':
		default:
			return [...current, ...next];
	}
}

function createRecord<T extends string, V> (
	keys: readonly T[],
	value: V
): Record<T, V> {
	const record = {} as Record<T, V>;
	for (const key of keys) {
		record[key] = value;
	}
	return record;
}

function deepClone <T> (
	value: T
): T {
	return JSON.parse(JSON.stringify(value)) as T;
}
