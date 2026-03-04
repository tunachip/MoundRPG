// src/combat/state/actor/listener.ts

import { Listener, createListener } from '../../listener';
import { Operation } from '../../operation';
import { Condition } from '../../condition';
import {
	ConditionDefinition,
	OperationDefinition,
	TriggeredOperationsDefinition,
	MoveDefinition,
} from '../../../content/moves';

export interface MoveListenerGroups {
	whileActive: Array<Listener>;
	whileBanked: Array<Listener>;
	whileOnCooldown: Array<Listener>;
}

interface CreateMoveListenersArgs {
	moveName: string;
	ownerIndex: number;
	moveIndex: number;
	operations: MoveDefinition['operations'];
	createOperation: (operation: OperationDefinition) => Operation;
}

export function createMoveListeners (
	args: CreateMoveListenersArgs,
): MoveListenerGroups {
	return {
		whileActive: createTriggeredListeners(
			args.operations.whileActive,
			args.moveName,
			args.ownerIndex,
			args.moveIndex,
			'whileActive',
			false,
			args.createOperation
		),
		whileBanked: createTriggeredListeners(
			args.operations.whileBanked,
			args.moveName,
			args.ownerIndex,
			args.moveIndex,
			'whileBanked',
			true,
			args.createOperation
		),
		whileOnCooldown: createTriggeredListeners(
			args.operations.whileOnCooldown,
			args.moveName,
			args.ownerIndex,
			args.moveIndex,
			'whileOnCooldown',
			false,
			args.createOperation
		),
	};
}

function createTriggeredListeners (
	triggeredOperations: Array<TriggeredOperationsDefinition> | undefined,
	moveName: string,
	ownerIndex: number,
	moveIndex: number,
	phase: string,
	isActive: boolean,
	createOperation: (operation: OperationDefinition) => Operation,
): Array<Listener> {
	if (!triggeredOperations || triggeredOperations.length === 0) {
		return [];
	}
	return triggeredOperations.map((entry, index) =>
		createListener({
			name: `${moveName}:${phase}:${index}`,
			source: {
				type: 'move',
				index: moveIndex,
			},
			owner: {
				type: 'entity',
				index: ownerIndex,
			},
			isActive,
			triggers: [entry.trigger],
			conditions: createConditionList(entry.conditions ?? []),
			operations: {
				fromActive: entry.operations.map((operation) => createOperation(operation)),
				fromBanked: [],
				fromOnCooldown: [],
			},
		})
	);
}

function createConditionList (
	conditions: Array<ConditionDefinition>,
): Array<Condition> {
	return conditions.map((condition) => ({
		name: condition.name,
		args: {} as Condition['args'],
		expects: condition.expects,
	}));
}
