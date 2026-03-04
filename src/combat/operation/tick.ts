// src/combat/operation/tick.ts

import type { OperationContext, OperationResult } from './types.ts';
import { calculateDamage, resolveDamage } from './damage.ts';
import { heal } from './health.ts';
import { forEachTargetEntity, requireCtxStatus } from './helpers.ts';
import type { Status, DamageElement } from '../../shared/types.ts';

function resolveStatusElement (
	status: Status
): DamageElement {
	switch (status) {
		case 'burn':
			return 'fire';
		case 'wound':
			return 'vital';
		default:
			return 'force';
	}
}

export function tickDamageStatus (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };
	const status = requireCtxStatus(ctx, 'tickStatus');

  forEachTargetEntity(ctx, (target) => {
		if (target.hasStatus[status]) {
			ctx.calculatedDamage = calculateDamage(
				1,
				resolveStatusElement(status),
				'status',
				target
			);
			return resolveDamage(ctx);
		}
  });
  return result;
}

export function tickRegen (
  ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };

  forEachTargetEntity(ctx, (target) => {
		if (target.hasStatus['regen']) {
			let amount = 0;
			if (target.attunedTo.fire) {
				amount += 1;
			}
			if (target.attunedTo.vital) {
				amount += 1;
			}
			ctx.amount = amount;
			return heal(ctx);
    }
  });
  return result;
}
