// src/content/fragments/types.ts

import type { DamageElement, Speed } from '../../shared/types.ts';
import type { OperationDefinition, TriggeredOperationsDefinition } from '../moves/index.ts';

interface OperationUpdates {
	when: string;
	operations: Array<OperationDefinition>;
}

interface TriggeredOperationsUpdates {
	when: string;
	operations: Array<TriggeredOperationsDefinition>;
}

interface OperationUpdateMatrix {
	fromActive?: Array<OperationUpdates>;
	fromBanked?: Array<OperationUpdates>;
	fromOnCooldown?: Array<OperationUpdates>;
	whileActive?: Array<TriggeredOperationsUpdates>;
	whileBanked?: Array<TriggeredOperationsUpdates>;
	whileOnCooldown?: Array<TriggeredOperationsUpdates>;
}

interface UpdatedNumber {
	change: 'add' | 'subtract' | 'multiply' | 'divide' | 'replace';
	value: number;
}

interface MetadataUpdates {
	element?: DamageElement;
	speed?: Speed;
	canChain?: boolean;
	damage?: UpdatedNumber;
	iterations?: UpdatedNumber;
}

export interface FragmentDefinition {
	name: string;
	element: DamageElement;
	metadataUpdates?: MetadataUpdates;
	operationUpdates?: OperationUpdateMatrix;
}
