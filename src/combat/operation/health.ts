// src/combat/operation/health.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetEntity, requireCtxAmount } from './helpers.ts';

export function raiseMaxHp (
	ctx: OperationContext
): OperationResult {
    const result: OperationResult = { breaks: false };
		const amount = requireCtxAmount(ctx, 'raiseMaxHp');
		forEachTargetEntity(ctx, (target, targetActor) => {
			target.maxHp += amount;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:maxHp:raised',
				actors: [targetActor],
			});
		});
    return result;
}

export function lowerMaxHp (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'lowerMaxHp');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.maxHp;
		const after = Math.max(0, current - amount)
		target.maxHp = after;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:maxHp:lowered',
			actors: [targetActor],
		});
	});
	return result;
}

export function heal (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'heal');
	forEachTargetEntity(ctx, (target, targetActor) => {
		const current = target.hp;
		const max = target.maxHp;
		const after = Math.min(max, current + amount);
		target.hp = after;
		result.triggers ??= [];
		result.triggers.push({
			trigger: 'entity:hp:gained',
			actors: [targetActor],
		});
	});

	return result;
}
