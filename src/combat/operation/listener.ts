// src/combat/operation/listener.ts

import { OperationContext, OperationResult } from './';
import { forEachTargetListener } from './helpers.ts';

export function activateListeners (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	forEachTargetListener(ctx, (listener, targetActor) => {
		if (!listener.isActive) {
			listener.isActive = true;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'listener:activated',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function deactivateListeners (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	forEachTargetListener(ctx, (listener, targetActor) => {
		if (listener.isActive) {
			listener.isActive = false;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'listener:deactivated',
				actors: [targetActor],
			});
		}
	});
	return result;
}
