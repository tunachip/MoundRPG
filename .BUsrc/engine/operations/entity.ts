// src/engine/operations/entity.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { maxClamped, minClamped } from '../helpers.ts';

export function applyCurseRisk (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.curseRisk;
		const add = args.amount ?? 0;
		const max = 10;
		const after = maxClamped(now, add, max);
		if (after[0] > now) {
			target.curseRisk = after[0];
		}
	}
	return { breaks: false };
}

export function negateCurseRisk (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		target.curseRisk = 0;
	}
	return { breaks: false };
}

export function reduceCurseRisk (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	const amount = args.amount ?? 0;
	if (target) {
		const now = target.curseRisk;
		const add = -1 * amount;
		const after = minClamped(now, add, 0);
		if (after[0] < now) {
			target.curseRisk = after[0];
		}
	}
	return { breaks: false };
}

export function extendCurseRisk (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.curseRisk;
		if (now > 0) {
			return applyCurseRisk(args);
		}
	}
	return { breaks: false };
}

export function spendCurseRisk (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	const amount = args.amount ?? 0;
	if (target) {
		const now = target.curseRisk;
		const add = -1 * amount;
		const after = minClamped(now, add, 0);
		if (after[0] < now) {
			target.curseRisk = after[0];
			return { breaks: false, ctx: { spent: now - after[0] } };
		}
	}
	return { breaks: false, ctx: { spent: 0} };
}

