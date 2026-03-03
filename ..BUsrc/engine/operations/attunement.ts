// src/engine/operations/attunement.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';

export function applyAttunement (
	args: OperationContext
): OperationResult {
	const element = args.element;
	const target = args.targetEntity;
	if (target && !target.attunedTo[element]) {
		target.attunedTo[element] = true;
	}
	return { breaks: false };
}

export function negateAttunement (
	args: OperationContext
): OperationResult {
	const element = args.element;
	const target = args.targetEntity;
	if (target && target.attunedTo[element]) {
		target.attunedTo[element] = false;
		target.turnsAttuned[element] = 0;
	}
	return { breaks: false };
}

export function spendAttunement (
	args: OperationContext
): OperationResult {
	const element = args.element;
	const target = args.targetEntity;
	if (target && target.attunedTo[element]) {
		const spent = target.turnsAttuned[element];
		negateAttunement(args);
		return { breaks: false, ctx: {spent: spent} };
	}
	return { breaks: false, ctx: {spent: 0} };
}

