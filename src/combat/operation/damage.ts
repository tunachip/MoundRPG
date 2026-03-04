// src/combat/operation/damage.ts

import {
	type OperationContext,
	type OperationResult,
	type DamageResult,
} from './types.ts';
import { requireCtxCalculatedDamage, forEachTargetEntity } from './helpers.ts';
import { heal } from './health.ts';
import { negateAttunement } from './attunement.ts';
import type { CombatEntity } from '../state/index.ts';
import { getDamageRules } from '../../shared/damageRules.ts';
import type { DamageElement } from '../../shared/types.ts';

export function calculateDamage (
	baseDamage: number,
	element: DamageElement,
	source: 'attack' | 'status',
	target: CombatEntity,
	caster?: CombatEntity,
): DamageResult {
	if (source === 'attack' && caster) {
		return applyElementalModifiers(
			applyStatusModifiers(
				baseDamage,
				caster.hasStatus.strong,
				target.hasStatus.tough
			),
			element,
			target.attunedTo,
		);
	}
	else {
		return applyElementalModifiers(
			baseDamage,
			element,
			target.attunedTo,
		)
	}
}

export function resolveDamage (
	ctx: OperationContext
): OperationResult {
  const result: OperationResult = { breaks: false };
	const calculatedDamage = requireCtxCalculatedDamage(ctx, 'resolveDamage');

	forEachTargetEntity(ctx, (target, targetActor) => {
		switch (true) {
			case (calculatedDamage.absorb > 0):
				ctx.amount = 0;
				return heal(ctx);
			case (calculatedDamage.blockedBy.length > 0):
				ctx.element = calculatedDamage.blockedBy[0];
				return negateAttunement(ctx);
			case (calculatedDamage.damage > 0):
				const current = target.hp;
				const after = Math.max(0, current - calculatedDamage.damage);
				target.hp = after;
			
				result.triggers ??= [];
				if (after === 0) {
					result.triggers.push({
						trigger: 'pre:entity:death',
						actors: [targetActor],
					});
				}
				result.triggers.push({
					trigger: 'entity:hp:lost',
					actors: [targetActor],
				});
			default:
				break;
		}
	});
  return result;
}

function applyStatusModifiers (
	baseDamage: number,
	casterHasStrong: boolean,
	targetHasTough: boolean,
): number {
	let damage = baseDamage;
	if (casterHasStrong) damage += 1;
	if (targetHasTough) damage -= 1;
	return Math.max(0, damage);
}

function countMatchingAttunements (
	targetAttunements: Record<DamageElement, boolean>,
	elements: Array<DamageElement>,
): number {
	return elements.filter(
		(element) => targetAttunements[element]
	).length;
}

function applyElementalModifiers (
	baseDamage: number,
	damageElement: DamageElement,
	targetAttunements: Record<DamageElement, boolean>,
): DamageResult {
	const rules = getDamageRules(damageElement);
	const add = countMatchingAttunements(targetAttunements, rules.weakTo);
	const sub = countMatchingAttunements(targetAttunements, rules.resists);
	const damage = Math.max(0, baseDamage + add - sub);
	const absorb = countMatchingAttunements(targetAttunements, rules.absorbs);
	return {
		damage: damage,
		absorb: absorb,
		blockedBy: rules.blocks.filter((element) => targetAttunements[element]),
	};
}
