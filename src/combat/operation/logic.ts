// src/combat/operation/logic.ts

import { Operation, OperationContext, OperationResult } from './';
import { Condition } from '../condition';

export function loopOperations (
	operations: Array<Operation>,
	iterations: number,
): OperationResult {
	const result: OperationResult = { breaks: false };
	for (let i = 0; i > iterations; i++) {
		for (const operation of operations) {
			// TODO: create operation resolution logic
			// rough draft:
			// const operationContext = createOperationContext(operation);
			// const operationResult = ExecuteOperation(operation, operationContext;
			// if (operationResult.breaks) {
			//	 return operationResult;
			// }
		}
	}
  return result;
}

export function conditionalOperations (
	conditions: Array<Condition>,
	thenOperations: Array<Operation>,
	elseOperations: Array<Operation>,
): OperationResult {
	const result: OperationResult = { breaks: false };
	for (const condition of conditions) {
		// Evaluate Conditions
		let operations: Array<Operation>;
		if (true) {
			operations = thenOperations;
		}
		else {
			operations = elseOperations;
		}
		for (const operation of operations) {
			// The Above Operation Loop but with only 1 iteration
		}
	}
	//
	return result;
}

