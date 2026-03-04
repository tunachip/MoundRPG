// src/combat/operation/energy.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetEntity, requireCtxAmount } from './helpers.ts';

export function applyEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyEnergy');

	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.energy;
		const max	= target.maxEnergy;
		if (current < max) {
			target.energy = Math.min(max, current + amount);
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:energy:gained',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function reduceEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'reduceEnergy');

	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.energy;
		if (current > 0) {
			target.energy = Math.max(0, current - amount);
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:energy:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function negateEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };

	forEachTargetEntity(ctx, (target, targetActor) => {
		if (target.energy > 0) {
			target.energy = 0;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:energy:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function spendEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'spendEnergy');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.energy;
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.energy = after;
			result.changes ??= [];
			result.changes.push({
				field: 'entity.energy',
				before: current,
				after: after,
			});
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:energy:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function raiseMaxEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'raiseMaxEnergy');
	forEachTargetEntity(ctx, (target, targetActor) => {
		target.maxEnergy += amount;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:maxEnergy:raised',
			actors: [targetActor],
		});
	});
	return result;
}

export function lowerMaxEnergy (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'lowerMaxEnergy');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.maxEnergy;
		const after = Math.max(0, current - amount)
		target.maxEnergy = after;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:maxEnergy:lowered',
			actors: [targetActor],
		});
	});
	return result;
}
