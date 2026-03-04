// src/combat/operation/status.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetEntity, requireCtxAmount, requireCtxStatus } from './helpers.ts';

export function applyStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'applyStatus');
	const amount = requireCtxAmount(ctx, 'applyStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.statusTurns[status];
		const max = target.maxStatusTurns[status];
		if (current < max) {
			const after = Math.min(max, current + amount);
			target.hasStatus[status] = true;
			target.statusTurns[status] = after;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:status:gained',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function reduceStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'reduceStatus');
	const amount = requireCtxAmount(ctx, 'reduceStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.statusTurns[status];
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.statusTurns[status] = after;
			if (after < 1) {
				target.hasStatus[status] = false;
			}
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:status:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function negateStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'negateStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		if (target.hasStatus[status]) {
			target.hasStatus[status] = false;
			target.statusTurns[status] = 0;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:status:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function spendStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'spendStatus');
	const amount = requireCtxAmount(ctx, 'spendStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.statusTurns[status];
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.statusTurns[status] = after;
			if (after < 1) {
				target.hasStatus[status] = false;
			}
			result.changes ??= [];
			result.changes.push({
				field: 'entity.statusTurns',
				before: current,
				after: after,
			});
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:status:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function raiseMaxStatusTurns (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'raiseMaxStatusTurns');
	const amount = requireCtxAmount(ctx, 'raiseMaxStatusTurns');
	forEachTargetEntity(ctx, (target, targetActor) => {
		target.maxStatusTurns[status] += amount;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:maxStatusTurns:raised',
			actors: [targetActor],
		});
	});
	return result;
}

export function lowerMaxStatusTurns (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'lowerMaxStatusTurns');
	const amount = requireCtxAmount(ctx, 'lowerMaxStatusTurns');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.maxStatusTurns[status];
		const after = Math.max(0, current - amount)
		target.maxStatusTurns[status] = after;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:maxStatusTurns:lowered',
			actors: [targetActor],
		});
	});
	return result;
}
