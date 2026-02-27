// src/engine/operations/energy.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { maxClamped, minClamped } from '../helpers.ts';
import { logEvent } from '../log.ts';

export function applyEnergy (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.energy;
		const add = args.amount ?? 0;
		const max = target.maxEnergy;
		const after = maxClamped(now, add, max);
		const extra = after[1];
		if (extra > 0) {
			// TODO: EmitSignal 'energy overload'
		}
		target.energy = after[0];
	}
	return { breaks: false };
}

export function reduceEnergy (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.energy;
		if (now === 0) {
				logEvent(
					`Reduce Energy on ${target.name}`, 'FAILED',
					`${target.name} has 0 Energy.`
				);
		}
		const minus = -1 * (args.amount ?? 0);
		const max = target.maxEnergy;
		const after = minClamped(now, minus, max);
		if (after[0] < now) {
			target.energy = after[0];
		}
	}
	return { breaks: false };
}

export function negateEnergy (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.energy;
		switch (now) {
			case 0:
				logEvent(
					`Negate Energy on ${target.name}`, 'FAILED',
					`${target.name} has 0 Energy.`
				);
				break;
			default:
				target.energy = 0;
				break;
		}
	}
	return { breaks: false };
}

export function spendEnergy (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	if (target) {
		const now = target.energy;
		if (now === 0) {
				logEvent(
					`Spend Energy from ${target.name}`, 'FAILED',
					`${target.name} has 0 Energy.`
				);
		}
		const minus = -1 * (args.amount ?? 0);
		const max = target.maxEnergy;
		const after = minClamped(now, minus, max);
		if (after[0] < now) {
			target.energy = after[0];
		}
		const spent = after[1];
		return { breaks: false, ctx: {spent: spent} };
	}
	return { breaks: false, ctx: {spent: 0} };
}

