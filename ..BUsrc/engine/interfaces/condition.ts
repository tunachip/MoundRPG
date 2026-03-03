// src/engine/interfaces/condition.ts

import { OperationFunction, Ctx } from '../types.ts';
import { Operation } from './operation.ts';

export interface Condition {
	name:		 string;
	args:		 Ctx;
	expects: any;
}

export interface ConditionalOperations {
	conditions: Array<Condition>;
	operations: Array<Operation>;
}
