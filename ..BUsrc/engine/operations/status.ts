// src/engine/operations/status.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { maxClamped, minClamped } from '../helpers.ts';

// TODO: Add logEvent statements for failed cases

export function applyStatus (
	args: OperationContext
): OperationResult {
	const status = args.status;
	const target = args.targetEntity;
	if (target && status) {
		const now = target.statusTurns[status];
		const add = args.turns ?? 0;
		const max = target.maxStatusTurns[status];
		const after = maxClamped(now, add, max);
		if (after[0] > now) {
			target.statusTurns[status] = after[0];
		}
		if (!target.hasStatus[status]) {
			target.hasStatus[status] = true;
		}
	}
	return { breaks: false };
}

export function reduceStatus (
	args: OperationContext
): OperationResult {
	const status = args.status;
	const target = args.targetEntity;
	if (target && status) {
		const now = target.statusTurns[status];
		const minus = -1 * (args.turns ?? 0);
		const max = target.maxStatusTurns[status];
		const after = minClamped(now, minus, max);
		if (after[0] < now) {
			target.statusTurns[status] = after[0];
		}
		if (after[0] === 0) {
			negateStatus(args);
		}
	}
	return { breaks: false };
}

export function extendStatus (
	args: OperationContext
): OperationResult {
	const status = args.status;
	const target = args.targetEntity;
	if (target && status){
		if (target.hasStatus[status]) {
			applyStatus(args);
		}
	}
	return { breaks: false };
}

export function negateStatus (
	args: OperationContext
): OperationResult {
	const status = args.status;
	const target = args.targetEntity;
	if (target && status) {
		if (target.hasStatus[status]) {
			target.hasStatus[status] = false;
		}
		if (target.statusTurns[status]) {
			target.statusTurns[status] = 0;
		}
	}
	return { breaks: false };
}

export function spendAttunement (
	args: OperationContext
): OperationResult {
	const status = args.status;
	const target = args.targetEntity;
	if (target && status && target.hasStatus[status]) {
		const spent = target.statusTurns[status];
		negateStatus(args);
		return { breaks: false, ctx: {spent: spent} };
	}
	return { breaks: false, ctx: {spent: 0} };
}

