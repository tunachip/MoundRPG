// src/combat/operation/curse.ts

import { OperationContext, OperationResult } from './';
import { forEachTargetEntity, requireCtxAmount } from './helpers.ts';

export function applyCurseRisk (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyCurseRisk');
	
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.curseRisk;
		if (current < 10) {
			const after = Math.min(10, current + amount);
			target.curseRisk = after;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:curseRisk:gained',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function reduceCurseRisk (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyCurseRisk');
	
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.curseRisk;
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.curseRisk = after;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:curseRisk:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function negateCurseRisk (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.curseRisk;
		if (current > 0) {
			target.curseRisk = 0;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:curseRisk:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function spendCurseRisk (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'spendCurseRisk');
	
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.curseRisk;
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.curseRisk = after;

			result.changes ??= [];
			result.changes.push({
				field: 'entity.curseRisk',
				before: current,
				after: after,
			});
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:curseRisk:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}
