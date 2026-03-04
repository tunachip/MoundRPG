// src/combat/operation/attack.ts

import { OperationContext, OperationResult, calculateDamage, resolveDamage } from './';
import { forEachTargetEntity, requireCombatEntity, requireCtxBaseDamage, requireCtxElement } from './helpers.ts';
import { DamageElement, getDamageRules } from '../../shared';

export function attack (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const caster = requireCombatEntity(ctx.combat, ctx.caster);
	const baseDamage = requireCtxBaseDamage(ctx, 'attack');
	const element = requireCtxElement(ctx, 'attack');

	forEachTargetEntity(ctx, (target, targetActor) => {
		ctx.calculatedDamage = calculateDamage(
			baseDamage,
			element,
			'attack',
			target,
			caster,
		);
		return resolveDamage(ctx);
	});
	return result;
}

