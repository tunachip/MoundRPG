// src/content/moves/types.ts

import { DamageElement, EventTrigger, ActorType, MoveType, Speed, Status, OpCode } from '../../shared';
import { Condition } from '../../combat/condition';

interface Range {
	min: number;
	max: number;
}

type OperationDefinitionTarget = 'caster' | 'chosen' | 'random' | 'self';

export interface OperationDefinitionArgs {
	[key: string]: unknown;
	targetCountRange?: Range;
	target?: OperationDefinitionTarget;
	targetType: ActorType;
	element?: 'meta' | DamageElement;
	status?: Status;
	amount?: number;
	baseDamage?: 'meta' | number;
	baseIterations?: 'meta' | number;
}

export interface OperationDefinition {
	operation: OpCode;
	args: OperationDefinitionArgs;
}

interface ConditionDefinitionArgs {

}

export interface ConditionDefinition {
	name: string;
	args: Array<ConditionDefinitionArgs>;
	expects: any;
}

export interface TriggeredOperationsDefinition {
	trigger: EventTrigger;
	conditions?: Array<ConditionDefinition>;
	operations: Array<OperationDefinition>;
}

interface OperationDefinitionMatrix {
	fromActive?: Array<OperationDefinition>;
	fromBanked?: Array<OperationDefinition>;
	fromOnCooldown?: Array<OperationDefinition>;
	// TODO: Update these to use 'ConditionalOperationDefinition'
	//
	whileActive?: Array<TriggeredOperationsDefinition>;
	whileBanked?: Array<TriggeredOperationsDefinition>;
	whileOnCooldown?: Array<TriggeredOperationsDefinition>;
}

export interface MoveDefinition {
	name: string;
	type: MoveType;
	element: DamageElement;
	speed: Speed;
	canChain: boolean;
	baseDamage: number;
	baseIterations: number;
	operations: OperationDefinitionMatrix;
}
