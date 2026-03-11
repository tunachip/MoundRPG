// src/combat/operation/ignore.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetEntity, requireCtxStatus } from './helpers.ts';

export function applyIgnoresStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'applyIgnoresStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		if (!target.ignoresStatus[status]) {
			target.ignoresStatus[status] = true;
			result.triggers ??=[];
			result.triggers.push({
				trigger: 'entity:ignoresStatus:gained',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function negateIgnoresStatus (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'negateIgnoresStatus');
	forEachTargetEntity(ctx, (target, targetActor) => {
		if (target.ignoresStatus[status]) {
			target.ignoresStatus[status] = false;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:ignoresStatus:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}
