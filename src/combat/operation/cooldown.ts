// src/combat/operation/cooldown.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetMove, requireCtxAmount } from './helpers.ts';

export function applyCooldown (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyCooldown');

  forEachTargetMove(ctx, (target, targetActor) => {	
		const current = target.cooldownTurns;
		if (current > -1) {
			const after = current + amount;
			target.cooldownTurns = after;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'move:cooldown:gained',
				actors: [targetActor],
			});
			if (current === 0) {
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'pre:move:enterCooldown',
					actors: [targetActor],
				});
			}
		}
  });
  return result;
}

export function reduceCooldown (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyCooldown');

  forEachTargetMove(ctx, (target, targetActor) => {	
		const current = target.cooldownTurns;
		if (current > 0) {
			const after = Math.max(0, current - amount);
			target.cooldownTurns = after;
			result.triggers ??= [];
			if (after === 0) {
				result.triggers.push({
					trigger: 'pre:move:leaveCooldown',
					actors: [targetActor],
				});
			}
			result.triggers.push({
				trigger: 'move:cooldown:lost',
				actors: [targetActor],
			});
		}
  });
  return result;
}

export function negateCooldown (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };

  forEachTargetMove(ctx, (target, targetActor) => {	
		if (target.cooldownTurns !== -1) {
			// TODO: Emit Trigger 'pre:move:leaveCooldown'
			target.cooldownTurns = 0;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'move:cooldown:lost',
				actors: [targetActor],
			});
			result.triggers.push({
				trigger: 'pre:move:leaveCooldown',
				actors: [targetActor],
			});
		}
  });
  return result;
}

export function spendCooldown (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };
	const amount = requireCtxAmount(ctx, 'applyCooldown');

  forEachTargetMove(ctx, (target, targetActor) => {	
		const current = target.cooldownTurns;
		if (current > -1) {
			const after = Math.max(0, current - amount);
			target.cooldownTurns = after;
			
			result.changes ??= [];
			result.triggers ??= [];
			if (after === 0) {
				result.triggers.push({
					trigger: 'pre:move:leaveCooldown',
					actors: [targetActor],
				});
			}
			result.changes.push({
				field: 'move.cooldownTurns',
				before: current,
				after: after,
			});
			result.triggers.push({
				trigger: 'move:cooldown:lost',
				actors: [targetActor],
			});
		}
  });
  return result;
}

export function applyPerpetualCooldown (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };

  forEachTargetMove(ctx, (target, targetActor) => {
		const before = target.cooldownTurns;
		if (before !== -1) {
			target.cooldownTurns = -1;
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'move:cooldown:gained',
				actors: [targetActor],
			});
			if (before === 0) {
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'pre:move:enterCooldown',
					actors: [targetActor],
				});
			}
		}
	});
  return result;
}
