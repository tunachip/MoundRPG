// src/combat/operation/attack.ts

import { OperationContext, OperationResult } from './';
import { forEachTargetEntity, requireCombatEntity, requireCtxBaseDamage, requireCtxElement } from './helpers.ts';
import { DamageElement, getDamageRules } from '../../shared';

interface DamageResult {
	damage: number;
	absorb: number;
	blockedBy: Array<DamageElement>;
}

export function attack (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const caster = requireCombatEntity(ctx.combat, ctx.caster);
	const baseDamage = requireCtxBaseDamage(ctx, 'attack');

	forEachTargetEntity(ctx, (target, targetActor) => {
		const attackResults = applyElementalModifiers(
			applyStatusModifiers(
				baseDamage,
				caster.hasStatus.strong,
				target.hasStatus.tough,
			),
			requireCtxElement(ctx, 'attack'),
			target.attunedTo,
		);
		if (attackResults.absorb > 0) {
			const current = target.hp;
			const max = target.maxHp;
			const after = Math.min(max, current + attackResults.absorb);
			if (after === max) {
				// TODO: Emit signal 'pre:entity:fullHeal'
				target.hp = after;
				// TODO: Emit signal 'post:entity:fullHeal'
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'entity:hp:gained',
					actors: [targetActor],
				});
			}
			else {
				target.hp = after;
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'entity:hp:gained',
					actors: [targetActor],
				});
			}
		}
		else if (attackResults.blockedBy.length > 0) {
			// TODO: Emit signal 'pre:entity:attunementBlock'
			target.attunedTo[attackResults.blockedBy[0]] = false;
			target.turnsAttuned[attackResults.blockedBy[0]] = 0;
			// TODO: Emit signal 'post:entity:attunementBlock'
			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:attunement:lost',
				actors: [targetActor],
			});
		}
		else if (attackResults.damage > 0) {
			const current = target.hp;
			const after = Math.max(0, current - attackResults.damage);
			if (after === 0) {
				// TODO: Emit Signal 'pre:entity:death'
				// this will trigger life-save effects
				target.hp = after;
				// TODO: Emit Signal 'post:entity:death'
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'entity:hp:lost',
					actors: [targetActor],
				});
			}
			else {
				target.hp = after;
				result.triggers ??= [];
				result.triggers.push({
					trigger: 'entity:hp:lost',
					actors: [targetActor],
				});
			}
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
